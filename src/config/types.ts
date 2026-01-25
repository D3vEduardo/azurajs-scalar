import { NextFunction, RequestServer, ResponseServer } from "azurajs/types";

export interface ScalarConfigType {
  apiSpecUrl: string;
  proxyUrl: string;
  customHtmlPath?: string; // Optional since it might not always be provided
}

export interface ScalarStoreType {
  proxy_url?: string;
  api_spec_url?: string;
  custom_html_path?: string;
}

export type ProxyMiddlewareType = (
  req: RequestServer,
  res: ResponseServer,
  next?: NextFunction,
) => Promise<void>;

// Define specific error types
export class ScalarError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(message: string, code: string, statusCode: number) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, ScalarError.prototype);
  }
}

export interface ProxyOptions {
  apiSpecUrl: string;
}
