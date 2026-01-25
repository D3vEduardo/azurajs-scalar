import { ProxyOptions } from "../config/types";
import { logger } from "azurajs/logger";
import { debug } from "../utils/debug";

export function proxyMiddleware({
  apiSpecUrl,
  app,
  baseUrl,
  proxyUrlPath,
}: ProxyOptions) {
  debug("Setting up proxy middleware:", {
    apiSpecUrl,
    proxyUrlPath,
  });
  return app.get(proxyUrlPath, async (req, res) => {
    debug("=== PROXY HIT ===");
    debug("Method:", req.method);
    debug("URL:", req.url);
    debug("Headers:", req.headers);

    try {
      if (!req.url || !req.method) {
        return res.status(400).json({ error: "Invalid request" });
      }

      logger("info", `[PROXY] ${req.method} ${req.url}`);

      /* =========================
         TARGET URL
      ========================= */
      const query = new URLSearchParams(req.url.split("?")[1] || "");
      const scalarUrl = query.get("scalar_url");
      const targetUrl = scalarUrl || apiSpecUrl;

      debug("Target URL:", targetUrl);

      /* =========================
         SAME-ORIGIN
      ========================= */
      const target = new URL(targetUrl);
      const apiBase = new URL(apiSpecUrl);
      const baseOrigin = new URL(baseUrl).origin;

      const allowed =
        target.origin === apiBase.origin || target.origin === baseOrigin;

      debug("Origin check:", {
        target: target.origin,
        apiSpec: apiBase.origin,
        base: baseOrigin,
        allowed,
      });

      if (!allowed) {
        logger("warn", `[PROXY] Blocked cross-origin: ${targetUrl}`);
        return res.status(403).json({ error: "Cross-origin blocked" });
      }

      /* =========================
         HEADERS
      ========================= */
      const headers: Record<string, string> = {};

      for (const [k, v] of Object.entries(req.headers)) {
        if (!v) continue;
        headers[k] = Array.isArray(v) ? v.join(", ") : v;
      }

      headers.host = apiBase.host;

      debug("Forward headers:", headers);

      /* =========================
         BODY
      ========================= */
      const body = ["GET", "HEAD"].includes(req.method)
        ? undefined
        : typeof req.body === "string"
          ? req.body
          : JSON.stringify(req.body);

      debug("Forward body type:", typeof body);
      debug("Forward body length:", body?.length ?? 0);

      /* =========================
         FETCH
      ========================= */
      const proxyRes = await fetch(targetUrl, {
        method: req.method,
        headers,
        body,
      });

      debug("=== FETCH RESPONSE ===");
      debug("Status:", proxyRes.status);
      debug("StatusText:", proxyRes.statusText);
      debug("URL:", proxyRes.url);

      const headersObj: Record<string, string> = {};
      for (const [k, v] of proxyRes.headers.entries()) {
        headersObj[k] = v;
      }
      debug("Response headers:", headersObj);

      debug("content-type:", proxyRes.headers.get("content-type"));
      debug("content-encoding:", proxyRes.headers.get("content-encoding"));
      debug("transfer-encoding:", proxyRes.headers.get("transfer-encoding"));
      debug("content-length:", proxyRes.headers.get("content-length"));

      /* =========================
         CORS
      ========================= */
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader(
        "Access-Control-Allow-Methods",
        "GET,POST,PUT,PATCH,DELETE,OPTIONS,HEAD",
      );
      res.setHeader("Access-Control-Allow-Headers", "*");
      res.setHeader("Access-Control-Expose-Headers", "*");

      /* =========================
         SAFE HEADERS PASS
      ========================= */
      for (const [key, value] of proxyRes.headers.entries()) {
        const k = key.toLowerCase();

        // quebram proxy quando body já vem decodado
        if (k === "content-encoding") continue;
        if (k === "content-length") continue;

        // headers de conexão
        if (
          [
            "connection",
            "keep-alive",
            "transfer-encoding",
            "te",
            "trailer",
            "upgrade",
            "host",
          ].includes(k)
        )
          continue;

        res.setHeader(key, value);
      }

      if (req.method === "OPTIONS") {
        debug("OPTIONS request -> end");
        return res.end();
      }

      /* =========================
         DEBUG SEVERO BODY
      ========================= */
      const arrayBuf = await proxyRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuf);

      debug("=== BODY DEBUG ===");
      debug("ArrayBuffer byteLength:", arrayBuf.byteLength);
      debug("Buffer length:", buffer.length);
      debug("Buffer empty:", buffer.length === 0);
      debug("First 50 bytes (hex):", buffer.subarray(0, 50).toString("hex"));
      debug(
        "First 200 chars (utf8):",
        buffer.subarray(0, 200).toString("utf8"),
      );
      debug("=== END BODY DEBUG ===");

      /* =========================
         SEND
      ========================= */
      res.status(proxyRes.status).send(buffer);
    } catch (err) {
      debug("=== PROXY ERROR ===");
      debug("Ocorreu um erro no proxy...", err);
      logger("error", `[PROXY] Error: ${err}`);
      res.status(500).json({ error: "Proxy error" });
    }
  });
}
