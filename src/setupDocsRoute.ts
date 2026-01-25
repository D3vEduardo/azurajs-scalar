import { logger } from "azurajs/logger";
import fs from "fs";
import path from "node:path";
import { ScalarError, SetupDocsRouteOptions } from "./config/types";
import { debug } from "./utils/debug";

export async function setupScalarDocs({
  app,
  docPath,
  customHtmlPath,
  apiSpecUrl,
  proxyUrl,
}: SetupDocsRouteOptions) {
  debug("Setting up docs route with options:", { docPath, customHtmlPath, apiSpecUrl, proxyUrl });

  return app.get(docPath, (req, res) => {
    debug("Docs route hit with request:", req.method, req.url);
    try {
      if (!proxyUrl || !apiSpecUrl) {
        debug("Missing required URLs - proxyUrl:", proxyUrl, "apiSpecUrl:", apiSpecUrl);
        throw new ScalarError(
          "Missing required URLs",
          "STORE_VALUES_MISSING",
          500,
        );
      }

      const htmlPath =
        customHtmlPath || path.join(__dirname, "../api-docs.html");
      debug("HTML template path:", htmlPath);

      if (!fs.existsSync(htmlPath)) {
        debug("HTML template not found at path:", htmlPath);
        throw new ScalarError(
          "HTML template not found",
          "HTML_TEMPLATE_NOT_FOUND",
          404,
        );
      }

      const html = fs.readFileSync(htmlPath, "utf-8");
      debug("HTML template read successfully, length:", html.length);

      const processedHtml = html
        .replace(/&{proxy_url}/g, proxyUrl)
        .replace(/&{api_spec_url}/g, apiSpecUrl);
      debug("HTML template processed with proxyUrl and apiSpecUrl");

      return res.send(processedHtml);
    } catch (error) {
      debug("Error in docs route:", error);
      if (error instanceof ScalarError) {
        logger("error", `[ScalarError] ${error.message}`);
        return res.status(error.statusCode).json({ message: error.message });
      } else {
        logger("error", String(error));
        return res.status(500).json({ message: "Server error" });
      }
    }
  });
}
