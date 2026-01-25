/**
 * @fileoverview Scalar client for API documentation proxy
 * This module provides a client for setting up API documentation with proxy capabilities
 */

import { ProxyMiddlewareType, ScalarConfigType, ScalarError } from "./config/types";
import { proxyMiddleware } from "./middleware/proxy";
import { store } from "./utils/store";

/**
 * Scalar client class for managing API documentation proxy
 */
export class Scalar {
  /**
   * Middleware function that handles proxying requests to the API specification
   */
  public proxyMiddleware: ProxyMiddlewareType;

  /**
   * Creates a new Scalar client instance
   * @param config Configuration object for the Scalar client
   */
  constructor(config: ScalarConfigType) {
    this.validateConfig(config);

    store.set("proxy_url", config.proxyUrl);
    store.set("api_spec_url", config.apiSpecUrl);
    store.set("custom_html_path", config.customHtmlPath);

    this.proxyMiddleware = proxyMiddleware({ apiSpecUrl: config.apiSpecUrl });
  }

  /**
   * Validates the provided configuration
   * @param config Configuration object to validate
   * @throws ScalarError if configuration is invalid
   */
  private validateConfig(config: ScalarConfigType): void {
    if (!config.apiSpecUrl) {
      throw new ScalarError(
        "apiSpecUrl is required",
        "MISSING_API_SPEC_URL",
        400
      );
    }

    if (!config.proxyUrl) {
      throw new ScalarError(
        "proxyUrl is required",
        "MISSING_PROXY_URL",
        400
      );
    }

    try {
      new URL(config.apiSpecUrl);
    } catch (error) {
      throw new ScalarError(
        "apiSpecUrl must be a valid URL",
        "INVALID_API_SPEC_URL",
        400
      );
    }

    try {
      new URL(config.proxyUrl);
    } catch (error) {
      throw new ScalarError(
        "proxyUrl must be a valid URL",
        "INVALID_PROXY_URL",
        400
      );
    }
  }
}
