import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import ts from "typescript";

const require = createRequire(import.meta.url);
const testEnv = { TURNSTILE_SITE_KEY: "1x00000000000000000000AA", TURNSTILE_SECRET_KEY: "1x0000000000000000000000000000000AA" };
function loadModule(path, dependencies, env, extras = {}) {
  const source = readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText;
  const exports = {};
  const mockRequire = (name) => {
    if (Object.hasOwn(dependencies, name)) return dependencies[name];
    if (name === "crypto" || name.startsWith("node:")) return require(name);
    throw new Error(`Unmocked dependency ${name}`);
  };
  vm.runInNewContext(js, { exports, require: mockRequire, Buffer, Error, URL, URLSearchParams, AbortSignal, process: { env }, console: { error() {} }, ...extras }, { filename: path });
  return exports;
}

function fixture({ env = testEnv, result = { success: true, hostname: "www.regulatel.org", action: "contact" }, fetchError, configured = true, denied = false } = {}) {
  const calls = { db: 0, fetch: 0, transactions: 0 };
  const sql = async (strings) => {
    calls.db++;
    if (strings.join("").trim().startsWith("CREATE") || strings.join("").trim().startsWith("DELETE")) return [];
    return [{ hits: 1 }];
  };
  sql.begin = async (callback) => {
    calls.transactions++;
    return callback(async (strings) => {
      calls.db++;
      return denied ? strings.join("").includes("SELECT GREATEST") ? [{ seconds: 77 }] : [] : [{ hits: 1 }];
    });
  };
  const security = loadModule("server/lib/formSecurity.ts", { "./db.js": { getDb: () => sql, isDbConfigured: () => configured } }, env, {
    fetch: async () => {
      calls.fetch++;
      if (fetchError) throw new Error("Private provider error secret_123");
      return { ok: true, json: async () => result };
    },
  });
  return { security, calls };
}
function response() {
  return { statusCode: 0, headers: {}, setHeader(name, value) { this.headers[name] = value; }, end(value) { this.body = value ? JSON.parse(value) : null; } };
}
function request(method = "POST", headers = {}, body = {}) {
  return { method, headers: { origin: "https://www.regulatel.org", "content-type": "application/json", ...headers }, socket: { remoteAddress: "192.0.2.1" }, async *[Symbol.asyncIterator]() { yield Buffer.from(JSON.stringify(body)); } };
}
function validBody(security, action = "contact") {
  return { email: "visitor@example.org", website: "", formToken: security.createFormConfiguration(action, Date.now() - 2100).formToken, turnstileToken: "fake-token-no-network", consent: true };
}

test("public POST requires permitted origin, JSON and matching method", () => {
  const { security } = fixture();
  for (const [req, status] of [
    [request("POST", { origin: "https://attacker.example" }), 403],
    [request("POST", { origin: undefined }), 403],
    [request("POST", { "content-type": "text/plain" }), 415],
    [request("GET"), 405],
  ]) {
    const res = response();
    assert.equal(security.preparePublicFormRequest(req, res, "POST"), false);
    assert.equal(res.statusCode, status);
    assert.equal(res.headers["Cache-Control"], "no-store");
  }
  const ok = response();
  assert.equal(security.preparePublicFormRequest(request(), ok, "POST"), true);
  assert.equal(ok.headers["Access-Control-Allow-Origin"], "https://www.regulatel.org");
  const preflight = response();
  assert.equal(security.preparePublicFormRequest(request("OPTIONS"), preflight, "POST"), false);
  assert.equal(preflight.statusCode, 204);
});

test("production excludes local origins and rejects provider testing keys", () => {
  const { security } = fixture({ env: { ...testEnv, VERCEL_ENV: "production" } });
  assert.equal(security.allowedFormOrigins().has("http://localhost:5173"), false);
  assert.throws(() => security.createFormConfiguration("subscribe"), (error) => error.status === 503);
  const missing = fixture({ env: {} });
  assert.throws(() => missing.security.createFormConfiguration("contact"), (error) => error.status === 503);
});

test("signed form binds action, rejects future timestamps, expiry and tampering", () => {
  const { security } = fixture();
  const now = Date.now();
  const token = security.createFormConfiguration("contact", now).formToken;
  assert.equal(security.validateFormToken(token, "contact", now - 1), false);
  assert.equal(security.validateFormToken(token, "contact", now), true);
  assert.equal(security.validateFormToken(token, "contact", now + 2000), true);
  assert.equal(security.validateFormToken(token, "subscribe", now + 2000), false);
  assert.equal(security.validateFormToken(token, "contact", now + 7_200_001), false);
  assert.equal(security.validateFormToken(`${token.slice(0, -1)}${token.endsWith("a") ? "b" : "a"}`, "contact", now + 2000), false);
  assert.equal(security.validateFormToken("bad", "contact", now + 2000), false);
});

test("body is bounded including streamed chunks and rejects non-object JSON", async () => {
  const { security } = fixture();
  await assert.rejects(security.readPublicFormBody(request("POST", { "content-length": "100000" })), (error) => error.status === 413);
  const streamed = { headers: {}, async *[Symbol.asyncIterator]() { yield Buffer.alloc(20_000); yield Buffer.alloc(20_000); } };
  await assert.rejects(security.readPublicFormBody(streamed), (error) => error.status === 413);
  for (const data of [null, [], "string"]) await assert.rejects(security.readPublicFormBody(request("POST", {}, data)), (error) => error.status === 400);
  const broken = { headers: {}, async *[Symbol.asyncIterator]() { yield Buffer.from("{"); } };
  await assert.rejects(security.readPublicFormBody(broken), (error) => error.status === 400);
});

test("legitimate maximum Unicode fields fit the request size cap", async () => {
  const { security } = fixture();
  const body = { ...validBody(security), name: "张".repeat(120), organization: "张".repeat(160), subject: "张".repeat(180), message: "张".repeat(5000), turnstileToken: "t".repeat(2048) };
  assert.equal((await security.readPublicFormBody(request("POST", {}, body))).message.length, 5000);
});

test("rate identity collapses Gmail dots, plus aliases and googlemail domain", () => {
  const { security } = fixture();
  for (const email of ["t.y.l.e.r+tag@gmail.com", "tyler@gmail.com", "TYLER+other@GOOGLEMAIL.COM"]) assert.equal(security.rateLimitEmail(email), "tyler@gmail.com");
  assert.equal(security.rateLimitEmail("a.b+tag@example.org"), "a.b+tag@example.org");
});

test("client IP only honors Vercel forwarding and ignores unrelated headers", () => {
  const local = fixture();
  const req = request("POST", { "x-forwarded-for": "198.51.100.2", "cf-connecting-ip": "203.0.113.2" });
  assert.equal(local.security.clientIp(req), "192.0.2.1");
  const vercel = fixture({ env: { ...testEnv, VERCEL: "1" } });
  assert.equal(vercel.security.clientIp(req), "198.51.100.2");
  req.headers["x-forwarded-for"] = "invalid";
  assert.equal(vercel.security.clientIp(req), "unknown");
});

test("provider proof requires success plus exact action and hostname", () => {
  const { security } = fixture();
  for (const result of [
    { success: false, hostname: "www.regulatel.org", action: "contact" },
    { success: true, hostname: "attacker.example", action: "contact" },
    { success: true, hostname: "www.regulatel.org", action: "subscribe" },
    { success: true },
  ]) assert.equal(security.isValidTurnstileResult(result, "contact"), false);
  assert.equal(security.isValidTurnstileResult({ success: true, hostname: "regulatel.org", action: "contact" }, "contact"), true);
});

test("honeypot and missing proof cause no DB or provider requests", async () => {
  for (const alter of [(body) => { body.website = "spam"; }, (body) => { delete body.formToken; }, (body) => { delete body.turnstileToken; }]) {
    const { security, calls } = fixture();
    const body = validBody(security);
    alter(body);
    const result = await security.protectForm(request(), body, "contact");
    assert.equal(result.ok, false);
    assert.equal(calls.db, 0);
    assert.equal(calls.fetch, 0);
  }
});

test("invalid provider proof cannot pass the submission guard", async () => {
  const { security, calls } = fixture({ result: { success: true, hostname: "attacker.example", action: "contact" } });
  const result = await security.protectForm(request(), validBody(security), "contact");
  assert.equal(result.ok, false);
  assert.equal(result.status, 400);
  assert.equal(calls.transactions, 1, "only attempt quota should be consumed");
});

test("guard fails closed on provider outage and database unavailability without leakage", async () => {
  for (const options of [{ fetchError: true }, { configured: false }]) {
    const { security } = fixture(options);
    const result = await security.protectForm(request(), validBody(security), "contact");
    assert.equal(result.ok, false);
    assert.equal(result.status, 503);
    assert.doesNotMatch(result.error, /secret_123|Private/);
  }
});

test("denied persistent quota returns retry interval before provider verification", async () => {
  const { security, calls } = fixture({ denied: true });
  const result = await security.protectForm(request(), validBody(security), "contact");
  assert.equal(result.ok, false);
  assert.equal(result.status, 429);
  assert.equal(result.retryAfter, 77);
  assert.equal(calls.fetch, 0);
});

test("valid proof consumes attempt and final quotas before succeeding", async () => {
  const { security, calls } = fixture();
  assert.equal((await security.protectForm(request(), validBody(security), "contact")).ok, true);
  assert.equal(calls.fetch, 1);
  assert.equal(calls.transactions, 2);
});

test("GET confirmation never activates a subscription or notifies staff", async () => {
  const { security } = fixture();
  let sideEffects = 0;
  const confirm = loadModule("server/api-handlers/confirm-subscription.ts", {
    "../lib/formSecurity.js": security,
    "../lib/subscribers.js": { confirmSubscriber: async () => { sideEffects++; } },
    "../lib/subscribeMail.js": { notifyStaffNewSubscriber: async () => { sideEffects++; } },
    "../lib/db.js": { isDbConfigured: () => true },
  }, testEnv).default;
  const res = response();
  await confirm(request("GET"), res);
  assert.equal(res.statusCode, 405);
  assert.equal(sideEffects, 0);
});

test("staff notification outage leaves confirmed subscriber successful", async () => {
  const { security } = fixture();
  let activations = 0;
  let notifications = 0;
  const mail = loadModule("server/lib/subscribeMail.ts", {
    "./contactMessages.js": { contactRecipients: () => ["mock@example.invalid"] },
    "./emailLayout.js": { wrapEmailHtml: () => "mock html", emailDetailsTable: () => "", escapeHtml: (value) => value },
    "resend": { Resend: class { emails = { send: async () => { notifications++; throw new Error("mock provider outage"); } }; } },
  }, { RESEND_API_KEY: "mock-only-no-network" });
  const confirm = loadModule("server/api-handlers/confirm-subscription.ts", {
    "../lib/formSecurity.js": security,
    "../lib/subscribers.js": { confirmSubscriber: async () => { activations++; return { ok: true, subscriber: { id: "test", email: "mock@example.invalid", unsubscribeToken: "mock", created: true, reactivated: false, confirmationKey: "mock" } }; } },
    "../lib/subscribeMail.js": mail,
    "../lib/db.js": { isDbConfigured: () => true },
  }, testEnv).default;
  const res = response();
  await confirm(request("POST", {}, { token: "t".repeat(43) }), res);
  assert.equal(activations, 1);
  assert.equal(notifications, 1);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.ok, true);
});
