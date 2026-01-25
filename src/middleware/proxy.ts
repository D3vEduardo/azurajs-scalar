import { ProxyOptions } from "../config/types";
import { logger } from "azurajs/logger";
import { debug } from "../utils/debug";

export function proxyMiddleware({
  apiSpecUrl,
  app,
  proxyUrlPath,
}: ProxyOptions) {
  debug("Setting up proxy middleware with options:", {
    apiSpecUrl,
    proxyUrlPath,
  });
  app.get(proxyUrlPath, () => {});
  return app.use(proxyUrlPath, async (req, res) => {
    debug("Proxy middleware hit with request:", req.method, req.url, "headers:", req.headers);
    try {
      if (!req.url || !req.method) {
        debug("Invalid request - missing url or method");
        res.status(400).json({ error: "Invalid request" });
        return;
      }

      logger("info", `[PROXY] ${req.method} ${req.url}`);

      // Extract target URL from scalar_url query param
      const url = new URL(`http://localhost${req.url}`);
      const scalarUrl = url.searchParams.get("scalar_url");
      debug("Extracted scalar_url from query params:", scalarUrl);

      // Determine target URL
      const targetUrl = scalarUrl || apiSpecUrl + url.pathname + url.search;
      debug("Determined target URL:", targetUrl);

      // Validate same origin for security
      const target = new URL(targetUrl);
      const apiBase = new URL(apiSpecUrl);
      debug(
        "Validating same origin - target origin:",
        target.origin,
        "apiBase origin:",
        apiBase.origin,
      );
      if (target.origin !== apiBase.origin) {
        logger("warn", `Blocked cross-origin: ${targetUrl}`);
        res.status(403).json({ error: "Cross-origin blocked" });
        return;
      }

      logger("info", `[PROXY] Forwarding to: ${targetUrl}`);

      // Prepare headers and body
      const headers: Record<string, string> = {};
      for (const [key, value] of Object.entries(req.headers)) {
        if (value) {
          headers[key] = Array.isArray(value) ? value.join(", ") : value;
        }
      }
      headers.host = apiBase.host;
      debug("Prepared headers:", headers);

      const body = ["GET", "HEAD"].includes(req.method)
        ? undefined
        : typeof req.body === "string"
          ? req.body
          : JSON.stringify(req.body);
      debug("Request body:", body);

      // Make request to target
      debug("Making fetch request to target URL:", targetUrl);
      const proxyRes = await fetch(targetUrl, {
        method: req.method,
        headers,
        body,
      });
      debug(
        "Fetch response received with status:",
        proxyRes.status,
      );

      // Set response headers
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader(
        "Access-Control-Allow-Methods",
        "GET,POST,PUT,PATCH,DELETE,OPTIONS",
      );
      res.setHeader("Access-Control-Allow-Headers", "*");

      for (const [key, value] of proxyRes.headers.entries()) {
        if (!key.toLowerCase().startsWith("access-control-")) {
          res.setHeader(key, value);
        }
      }

      if (req.method === "OPTIONS") {
        debug("OPTIONS request, ending response");
        res.end();
        return;
      }

      const buffer = Buffer.from(await proxyRes.arrayBuffer());
      debug(
        "Response buffer created with length:",
        buffer.length,
      );
      res.send(buffer);
    } catch (err) {
      debug("Error in proxy middleware:", err);
      logger("error", `[PROXY] Error: ${err}`);
      res.status(500).json({ error: "Proxy error", details: String(err) });
    }
  });
}
