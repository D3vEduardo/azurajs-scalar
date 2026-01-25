/**
 * @fileoverview Controller for serving Scalar API documentation
 * This module handles serving the API documentation HTML with proper URL replacements
 */

import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "fs";
import { logger } from "azurajs/logger";
import { ResponseServer } from "azurajs/types";
import { store } from "./utils/store";
import { ScalarError } from "./config/types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Serves the Scalar API documentation HTML page
 * Replaces placeholders in the HTML template with actual URLs from the store
 * @param res Response object to send the HTML to
 * @returns Promise that resolves when the response is sent
 */
export async function getScalarDocs(res: ResponseServer) {
  try {
    const customHtmlPath = store.get("custom_html_path");
    const proxyUrl = store.get("proxy_url");
    const apiSpecUrl = store.get("api_spec_url");

    if (!proxyUrl || !apiSpecUrl) {
      throw new ScalarError(
        "Proxy URL or API Spec URL not defined in store",
        "STORE_VALUES_MISSING",
        500
      );
    }

    const htmlPath = customHtmlPath || path.join(__dirname, "./api-docs.html");

    if (!fs.existsSync(htmlPath)) {
      throw new ScalarError(
        `HTML template file not found at path: ${htmlPath}`,
        "HTML_TEMPLATE_NOT_FOUND",
        404
      );
    }

    const html = fs.readFileSync(htmlPath, "utf-8");
    const processedHtml = html
      .replace(/&{proxy_url}/g, proxyUrl)
      .replace(/&{api_spec_url}/g, apiSpecUrl);

    return res.send(processedHtml);
  } catch (error) {
    if (error instanceof ScalarError) {
      logger("error", `[ScalarError] ${error.message}`);
      return res.status(error.statusCode).json({
        message: error.message,
        code: error.code,
      });
    } else {
      logger("error", String(error));
      return res.status(500).json({
        message: "Internal server error occurred while serving documentation",
        code: "INTERNAL_SERVER_ERROR",
      });
    }
  }
}
