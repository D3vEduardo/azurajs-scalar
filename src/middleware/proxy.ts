/**
 * @fileoverview Proxy middleware for API requests
 * This module provides a proxy middleware that forwards requests to the API specification
 */

import { ProxyOptions } from "../config/types";
import { NextFunction, RequestServer, ResponseServer } from "azurajs/types";
import { logger } from "azurajs/logger";

/**
 * Creates a proxy middleware function that forwards requests to the API specification
 * @param options Configuration options for the proxy
 * @returns Middleware function that handles proxying requests
 */
export function proxyMiddleware({
  apiSpecUrl,
}: ProxyOptions): (
  req: RequestServer,
  res: ResponseServer,
  next?: NextFunction,
) => Promise<void> {
  return async (
    req: RequestServer,
    res: ResponseServer,
    _next?: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.url || !req.method) {
        res.status(400).json({
          error: "Request URL and method are required",
          code: "INVALID_REQUEST"
        });
        return;
      }

      logger("info", `[PROXY] ${req.method} ${req.url}`);

      const url = new URL(req.url, "http://localhost");
      const targetUrl = apiSpecUrl + url.pathname + url.search;

      logger("info", `[PROXY] Forwarding to: ${targetUrl}`);

      // Convert Node.js headers to a format compatible with fetch
      const headers: Record<string, string> = {};
      for (const [key, value] of Object.entries(req.headers)) {
        if (value) {
          headers[key] = Array.isArray(value) ? value.join(", ") : value;
        }
      }
      headers.host = new URL(apiSpecUrl).host;

      // Prepare request body
      let body: BodyInit | null = null;
      if (!["GET", "HEAD"].includes(req.method)) {
        // For non-GET/HEAD requests, we need to properly serialize the body
        // Since req might contain various data types, we need to handle appropriately
        if (req.body) {
          if (typeof req.body === 'string') {
            body = req.body;
          } else if (typeof req.body === 'object') {
            body = JSON.stringify(req.body);
          }
        }
      }

      const proxyRes = await fetch(targetUrl, {
        method: req.method,
        headers,
        body,
      });

      logger("info", `[PROXY] Response: ${proxyRes.status}`);

      // CORS - IMPORTANT: define before copying response headers
      const responseHeaders: Record<string, string> = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "*",
      };

      // Copy response headers, avoiding CORS header conflicts
      for (const [key, value] of proxyRes.headers.entries()) {
        // Don't overwrite CORS headers
        if (!key.toLowerCase().startsWith("access-control-")) {
          responseHeaders[key] = value;
        }
      }

      res.writeHead(proxyRes.status, responseHeaders);

      if (req.method === "OPTIONS") {
        res.end();
        return;
      }

      const buffer = Buffer.from(await proxyRes.arrayBuffer());
      res.end(buffer);
    } catch (err) {
      logger("error", `[PROXY] Error: ${err}`);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({
        error: "Proxy error",
        details: err instanceof Error ? err.message : String(err),
        code: "PROXY_ERROR"
      }));
    }
  };
}
