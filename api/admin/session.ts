import type { IncomingMessage, ServerResponse } from "http";
import {
  getAdminAuthStatus,
  loginAdmin,
  logoutAdmin,
} from "../lib/adminAuth.js";

function sendJson(res: ServerResponse, status: number, data: unknown) {
  res.setHeader("Content-Type", "application/json");
  res.statusCode = status;
  res.end(JSON.stringify(data));
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  try {
    if (req.method === "GET") {
      sendJson(res, 200, await getAdminAuthStatus(req));
      return;
    }

    if (req.method === "POST") {
      const ok = await loginAdmin(req, res);
      if (!ok) {
        sendJson(res, 401, { error: "Usuario o contraseña incorrectos." });
        return;
      }
      sendJson(res, 200, { authenticated: true });
      return;
    }

    if (req.method === "DELETE") {
      await logoutAdmin(req, res);
      res.statusCode = 204;
      res.end();
      return;
    }

    res.statusCode = 405;
    res.end("Method Not Allowed");
  } catch (err) {
    console.error("api/admin/session", err);
    sendJson(res, 500, {
      error: err instanceof Error ? err.message : "Error interno de autenticación",
    });
  }
}
