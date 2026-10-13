import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import ts from "typescript";

const require = createRequire(import.meta.url);
function loadModule(relative, dependencies, env = {}) {
  const source = readFileSync(new URL(`../${relative}`, import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText;
  const exports = {};
  const mockRequire = (name) => {
    if (Object.hasOwn(dependencies, name)) return dependencies[name];
    if (name === "crypto" || name.startsWith("node:")) return require(name);
    throw new Error(`Test attempted to load a non-mocked dependency: ${name}`);
  };
  vm.runInNewContext(compiled, { exports, require: mockRequire, Buffer, Error, process: { env }, console: { error() {}, warn() {} }, URL, URLSearchParams }, { filename: relative });
  return exports;
}

const security = loadModule("server/lib/formSecurity.ts", { "./db.js": {} });
const contacts = loadModule("server/lib/contactMessages.ts", {
  "./formSecurity.js": security,
  "./emailLayout.js": {},
});
const message = { name: "María González", email: "maria@example.org", organization: null, subject: "Consulta institucional", message: "Solicito información sobre el próximo encuentro." };

test("validates realistic foreign names and multiline messages", () => {
  for (const name of ["محمد أحمد", "สมชายจารุวรรณสิริสุข", "Donaudampfschifffahrtsgesellschaft", "Jean-Pierre Lefèvre"]) {
    assert.equal(contacts.validateContactMessage({ ...message, name, message: "Consulta\nInformación\tDetalle" }).ok, true);
  }
  const result = contacts.validateContactMessage({ ...message, email: " MARIA@EXAMPLE.ORG " });
  assert.equal(result.ok, true);
  assert.equal(result.value.email, "maria@example.org");
});

test("rejects invalid addresses, controls and overlong fields before sending", () => {
  for (const email of ["a@", "a..b@example.org", "@example.org", "a@example", "a\nb@example.org"]) assert.equal(contacts.validateContactMessage({ ...message, email }).ok, false);
  for (const [key, limit] of [["name", 120], ["email", 254], ["organization", 160], ["subject", 180], ["message", 5000]]) {
    assert.equal(contacts.validateContactMessage({ ...message, [key]: "a".repeat(limit + 1) }).ok, false, key);
  }
  for (const key of ["name", "email", "organization", "subject", "message"]) assert.equal(contacts.validateContactMessage({ ...message, [key]: "hello\u0000world" }).ok, false, key);
  assert.equal(contacts.validateContactMessage({ ...message, subject: "Valid\r\nInjected" }).ok, false);
});

test("provider errors are sanitized and invalid contact cannot send", async () => {
  let sends = 0;
  const sender = loadModule("server/lib/contactMessages.ts", {
    "./formSecurity.js": security,
    "./emailLayout.js": { wrapEmailHtml: (value) => value.bodyHtml, emailDetailsTable: () => "", escapeHtml: (value) => value.replace(/</g, "&lt;") },
    "resend": { Resend: class { emails = { send: async () => { sends++; return { error: { message: "Provider raw private error fake_secret_123" } }; } }; } },
  }, { RESEND_API_KEY: "mock_only_no_network", CONTACT_TO_EMAIL: "mock@example.invalid" });
  assert.equal((await sender.sendContactMessage({ ...message, subject: "A\r\nB" })).ok, false);
  assert.equal(sends, 0);
  const result = await sender.sendContactMessage(message);
  assert.equal(result.ok, false);
  assert.equal(result.status, 502);
  assert.doesNotMatch(result.error, /private|fake_secret|Provider/);
  assert.equal(sends, 1);
});

function reviewFixture(send = async () => ({ ok: true })) {
  const rows = new Map();
  let sends = 0;
  const sql = async (strings, ...values) => {
    const query = strings.join("?").replace(/\s+/g, " ").trim();
    if (query.startsWith("CREATE")) return [];
    if (query.startsWith("INSERT")) {
      const [id, name, email, organization, subject, body, reasons] = values;
      rows.set(id, { id, name, email, organization, subject, message: body, reasons: JSON.parse(reasons), status: "pending", created_at: new Date().toISOString(), reviewed_at: null, reviewed_by: null, last_error: null });
      return [];
    }
    if (query.includes("SET status = 'sending'")) {
      assert.match(query, /WHERE id = \? AND status = 'pending'/);
      const [reviewer, id] = values;
      const row = rows.get(id);
      if (!row || row.status !== "pending") return [];
      row.status = "sending"; row.reviewed_by = reviewer; row.reviewed_at = new Date().toISOString();
      return [{ ...row }];
    }
    if (query.includes("SET status = 'approved'")) {
      assert.match(query, /AND status = 'sending'/);
      const row = rows.get(values[0]);
      if (row?.status === "sending") row.status = "approved";
      return [];
    }
    if (query.includes("SET status = 'failed'")) {
      const row = rows.get(values.at(-1));
      if (row?.status === "sending") { row.status = "failed"; row.last_error = values.length > 1 ? values[0] : "No se pudo confirmar la entrega."; }
      return [];
    }
    if (query.includes("SET status = 'discarded'")) {
      assert.match(query, /status IN \('pending', 'failed'\)/);
      const [reviewer, id] = values;
      const row = rows.get(id);
      if (!row || !["pending", "failed"].includes(row.status)) return [];
      row.status = "discarded"; row.reviewed_by = reviewer;
      return [{ id }];
    }
    throw new Error(`Unexpected mocked query: ${query}`);
  };
  const review = loadModule("server/lib/contactReview.ts", {
    "./db.js": { getDb: () => sql },
    "./contactMessages.js": { sendContactMessage: async (input) => { sends++; return send(input); } },
  });
  return { review, rows, sends: () => sends };
}

test("only paired random fields or many links trigger manual review", () => {
  const { review } = reviewFixture();
  assert.equal(review.contactReviewReasons(message).length, 0);
  assert.equal(review.contactReviewReasons({ ...message, name: "Donaudampfschifffahrtsgesellschaft", subject: "Telecommunications" }).length, 0);
  assert.equal(review.contactReviewReasons({ ...message, name: "JTVFasZPlmbrRINUdjceqVV", subject: "xywFScIFPaoJexd" }).length, 1);
  assert.equal(review.contactReviewReasons({ ...message, name: "JTVFasZPlmbrRINUdjceqVV" }).length, 0);
  assert.equal(review.contactReviewReasons({ ...message, message: "https://a.example https://b.example https://c.example https://d.example" }).length, 1);
});

test("queue does not send mail and discard keeps the complete record", async () => {
  const fixture = reviewFixture();
  const id = await fixture.review.queueContactForReview(message, ["Revisión manual"]);
  assert.equal(fixture.sends(), 0);
  assert.equal((await fixture.review.discardContactReview(id, "admin1")).ok, true);
  assert.equal(fixture.rows.get(id).message, message.message);
  assert.equal(fixture.rows.get(id).status, "discarded");
  assert.equal((await fixture.review.approveContactReview(id, "admin2")).ok, false);
  assert.equal(fixture.sends(), 0);
});

test("two simultaneous approvals claim only once and repeated requests do not send", async () => {
  let release;
  const fixture = reviewFixture(() => new Promise((resolve) => { release = resolve; }));
  const id = await fixture.review.queueContactForReview(message, ["Revisión manual"]);
  const first = fixture.review.approveContactReview(id, "admin1");
  while (!release) await new Promise((resolve) => setImmediate(resolve));
  assert.equal(fixture.rows.get(id).status, "sending");
  assert.equal((await fixture.review.approveContactReview(id, "admin2")).ok, false);
  assert.equal((await fixture.review.discardContactReview(id, "admin2")).ok, false);
  release({ ok: true });
  assert.equal((await first).ok, true);
  assert.equal((await fixture.review.approveContactReview(id, "admin1")).ok, false);
  assert.equal(fixture.sends(), 1);
  assert.equal(fixture.rows.get(id).status, "approved");
});

test("a failed delivery remains visible and cannot be blindly resent", async () => {
  const fixture = reviewFixture(async () => ({ ok: false, status: 502, error: "No se pudo enviar el mensaje." }));
  const id = await fixture.review.queueContactForReview(message, ["Revisión manual"]);
  assert.equal((await fixture.review.approveContactReview(id, "admin1")).ok, false);
  assert.equal(fixture.rows.get(id).status, "failed");
  assert.equal((await fixture.review.approveContactReview(id, "admin2")).ok, false);
  assert.equal(fixture.sends(), 1);
});

function contactHandlerFixture({ protectedResult = { ok: true }, reasons = [], value = message, validationOk = true, bodyError } = {}) {
  const calls = [];
  class PublicFormError extends Error { constructor(status, text) { super(text); this.status = status; } }
  const handler = loadModule("server/api-handlers/contact.ts", {
    "../lib/formSecurity.js": {
      preparePublicFormRequest: () => true,
      readPublicFormBody: async () => { if (bodyError) throw new PublicFormError(413, "Too large"); return value; },
      protectForm: async () => { calls.push("protect"); return protectedResult; },
      PublicFormError,
    },
    "../lib/contactMessages.js": {
      validateContactMessage: () => validationOk ? { ok: true, value } : { ok: false, status: 400, error: "Invalid" },
    },
    "../lib/contactReview.js": {
      contactReviewReasons: () => reasons,
      queueContactForReview: async () => { calls.push("queue"); return "contact_00000000-0000-0000-0000-000000000001"; },
      approveContactReview: async () => { calls.push("send"); return { ok: true }; },
    },
  }).default;
  const res = { statusCode: 0, headers: {}, setHeader(name, val) { this.headers[name] = val; }, end(value) { this.body = JSON.parse(value); } };
  return { handler, calls, res };
}

test("contact rejects bot proof before either delivery or quarantine", async () => {
  for (const reasons of [[], ["Revisión manual"]]) {
    const fixture = contactHandlerFixture({ reasons, protectedResult: { ok: false, status: 400, error: "Invalid proof" } });
    await fixture.handler({}, fixture.res);
    assert.equal(fixture.res.statusCode, 400);
    assert.deepEqual(fixture.calls, ["protect"]);
  }
});

test("contact quarantine returns generic success without sending", async () => {
  const fixture = contactHandlerFixture({ reasons: ["Revisión manual"] });
  await fixture.handler({}, fixture.res);
  assert.deepEqual(fixture.calls, ["protect", "queue"]);
  assert.deepEqual(fixture.res.body, { ok: true });
});

test("normal contact is persisted before its delivery claim", async () => {
  const fixture = contactHandlerFixture();
  await fixture.handler({}, fixture.res);
  assert.deepEqual(fixture.calls, ["protect", "queue", "send"]);
  assert.deepEqual(fixture.res.body, { ok: true });
});

test("rate limit sets Retry-After while honeypot returns silent success", async () => {
  const limited = contactHandlerFixture({ protectedResult: { ok: false, status: 429, error: "Limited", retryAfter: 60 } });
  await limited.handler({}, limited.res);
  assert.equal(limited.res.statusCode, 429);
  assert.equal(limited.res.headers["Retry-After"], "60");
  const silent = contactHandlerFixture({ protectedResult: { ok: false, status: 400, error: "Bot", silent: true } });
  await silent.handler({}, silent.res);
  assert.deepEqual(silent.res.body, { ok: true });
  assert.deepEqual(silent.calls, ["protect"]);
});

test("oversized body and invalid fields cause no external effects", async () => {
  for (const options of [{ bodyError: true }, { validationOk: false }]) {
    const fixture = contactHandlerFixture(options);
    await fixture.handler({}, fixture.res);
    assert.equal(fixture.res.statusCode, options.bodyError ? 413 : 400);
    assert.deepEqual(fixture.calls, []);
  }
});

function adminFixture(role = "admin", authenticated = true) {
  const calls = [];
  const dependencies = Object.fromEntries([
    "bcryptjs", "../lib/adminUsers.js", "../lib/auditLog.js", "../lib/documentAccess.js", "../lib/parseBody.js", "../lib/seedLegacyEvents.js", "../lib/subscribers.js", "../lib/analytics.js", "../lib/sendNewsletter.js",
  ].map((name) => [name, {}]));
  dependencies["../lib/db.js"] = { isDbConfigured: () => true };
  dependencies["../lib/adminAuth.js"] = { ensureAdmin: async () => {
    if (!authenticated) { const err = new Error("No autorizado"); err.name = "UnauthorizedError"; throw err; }
    return { user: { id: "admin1", role } };
  } };
  dependencies["../lib/contactReview.js"] = {
    listContactReviews: async () => { calls.push("list"); return { items: [], total: 0 }; },
    approveContactReview: async () => { calls.push("approve"); return { ok: true }; },
    discardContactReview: async () => { calls.push("discard"); return { ok: true }; },
  };
  const handler = loadModule("server/api-handlers/admin.ts", dependencies).default;
  const res = { statusCode: 0, headers: {}, setHeader(name, value) { this.headers[name] = value; }, end(value) { this.body = JSON.parse(value); } };
  return { handler, calls, res };
}

test("contact review rejects unauthenticated requests and editor users", async () => {
  for (const [role, authenticated, expected] of [["admin", false, 401], ["editor", true, 403]]) {
    for (const [method, path] of [["GET", "/api/admin/contact-messages"], ["POST", "/api/admin/contact-messages/contact_00000000-0000-0000-0000-000000000001/approve"]]) {
      const fixture = adminFixture(role, authenticated);
      await fixture.handler({ url: path, method, headers: { host: "localhost" } }, fixture.res);
      assert.equal(fixture.res.statusCode, expected);
      assert.deepEqual(fixture.calls, []);
    }
  }
});

test("admin review requires valid identifiers and status before executing", async () => {
  const badId = adminFixture();
  await badId.handler({ url: "/api/admin/contact-messages/invalid/approve", method: "POST", headers: { host: "localhost" } }, badId.res);
  assert.equal(badId.res.statusCode, 400);
  assert.deepEqual(badId.calls, []);
  const badStatus = adminFixture();
  await badStatus.handler({ url: "/api/admin/contact-messages?status=unknown", method: "GET", headers: { host: "localhost" } }, badStatus.res);
  assert.equal(badStatus.res.statusCode, 400);
  assert.deepEqual(badStatus.calls, []);
  const valid = adminFixture();
  await valid.handler({ url: "/api/admin/contact-messages?status=pending", method: "GET", headers: { host: "localhost" } }, valid.res);
  assert.equal(valid.res.statusCode, 200);
  assert.equal(valid.res.headers["Cache-Control"], "no-store");
  assert.deepEqual(valid.calls, ["list"]);
});
