/**
 * Scalar client for API documentation
 */
import {
  ScalarConfigType,
  ScalarError,
  SetupDocsRouteOptions,
} from "./config/types";
import { proxyMiddleware } from "./middleware/proxy";
import { setupScalarDocs } from "./setupDocsRoute";
import { store } from "./utils/store";
import { debug } from "./utils/debug";

export class Scalar {
  constructor(config: ScalarConfigType) {
    debug("Scalar constructor called with config:", config);

    // Normalize baseUrl to ensure it's a valid absolute URL before validation
    const normalizedConfig = { ...config };
    normalizedConfig.baseUrl = this.normalizeBaseUrl(config.baseUrl);
    debug("Normalized config:", normalizedConfig);

    // Validate the configuration
    this.validateConfig(normalizedConfig);

    // Set default paths if not provided
    const proxyPath = normalizedConfig.proxyPath || "/scalar/proxy";
    const docPath = normalizedConfig.docPath || "/docs";
    const apiSpecPath = normalizedConfig.apiSpecPath || "";
    debug(
      "Using paths - proxyPath:",
      proxyPath,
      "docPath:",
      docPath,
      "apiSpecPath:",
      apiSpecPath,
    );

    // Calculate full URLs from baseUrl and paths
    const proxyUrl = this.joinUrl(normalizedConfig.baseUrl, proxyPath);
    const docUrl = this.joinUrl(normalizedConfig.baseUrl, docPath);
    const apiSpecUrl = this.joinUrl(normalizedConfig.baseUrl, apiSpecPath);
    debug(
      "Calculated URLs - proxyUrl:",
      proxyUrl,
      "docUrl:",
      docUrl,
      "apiSpecUrl:",
      apiSpecUrl,
    );

    // Store the calculated URLs
    store.set("proxy_url", proxyUrl);
    store.set("api_spec_url", apiSpecUrl);
    store.set("doc_url", docUrl);
    debug("Stored URLs in store");

    // Call setup with the calculated URLs
    setupScalarDocs({
      ...normalizedConfig,
      proxyUrl,
      docPath,
      apiSpecUrl,
    });
    debug("setupScalarDocs called");

    // Setup proxy middleware
    proxyMiddleware({
      apiSpecUrl,
      proxyUrlPath: proxyPath,
      app: normalizedConfig.app,
      baseUrl: normalizedConfig.baseUrl,
    });
    debug("proxyMiddleware called");
  }

  private joinUrl(baseUrl: string, path: string): string {
    // Normalize the baseUrl to ensure it ends with a slash
    const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl : baseUrl + "/";

    // Normalize the path to ensure it starts with a slash
    const normalizedPath = path.startsWith("/") ? path : "/" + path;

    // Join the baseUrl and path, removing any double slashes
    return normalizedBaseUrl.replace(/\/$/, "") + normalizedPath;
  }

  private normalizeBaseUrl(baseUrl: string): string {
    if (!baseUrl) {
      throw new ScalarError(
        "baseUrl is required",
        "MISSING_REQUIRED_CONFIG",
        400,
      );
    }

    // If baseUrl doesn't start with a protocol, prepend http://
    if (!/^https?:\/\//i.test(baseUrl)) {
      return "http://" + baseUrl;
    }

    return baseUrl;
  }

  private validateConfig(config: ScalarConfigType): void {
    if (!config.baseUrl) {
      throw new ScalarError(
        "baseUrl is required",
        "MISSING_REQUIRED_CONFIG",
        400,
      );
    }

    try {
      // Validate baseUrl
      debug("Validating baseUrl:", config.baseUrl);
      new URL(config.baseUrl);

      // Validate paths if provided
      if (config.proxyPath) {
        debug("Validating proxyPath:", config.proxyPath);
        if (!this.isValidPath(config.proxyPath)) {
          debug("proxyPath validation FAILED");
          throw new Error("Invalid proxyPath");
        }
      }

      if (config.docPath) {
        debug("Validating docPath:", config.docPath);
        if (!this.isValidPath(config.docPath)) {
          debug("docPath validation FAILED");
          throw new Error("Invalid docPath");
        }
      }

      if (config.apiSpecPath) {
        debug("Validating apiSpecPath:", config.apiSpecPath);
        if (!this.isValidPath(config.apiSpecPath)) {
          debug("apiSpecPath validation FAILED");
          throw new Error("Invalid apiSpecPath");
        }
      }
    } catch (error) {
      debug("Validation error:", error);
      throw new ScalarError("Invalid URL provided", "INVALID_URL", 400);
    }
  }

  private isValidPath(path: string): boolean {
    // Aceita paths relativos com barras no meio e no final
    return (
      typeof path === "string" &&
      /^\/[a-zA-Z0-9\-._~:\/@!$&'()*+,;=]*\/?$/.test(path)
    );
  }
}
