import { AzuraClient } from "azurajs";
import { NextFunction, RequestServer, ResponseServer } from "azurajs/types";

export interface ScalarConfigType {
  baseUrl: string;
  proxyPath?: string;
  docPath?: string;
  apiSpecPath?: string;
  customHtmlPath?: string;
  app: AzuraClient;
}

export interface ScalarStoreType {
  proxy_url?: string;
  api_spec_url?: string;
  doc_url?: string;
  custom_html_path?: string;
}

export type ProxyMiddlewareType = (
  req: RequestServer,
  res: ResponseServer,
  next?: NextFunction,
) => Promise<void>;

export class ScalarError extends Error {
  constructor(
    public readonly message: string,
    public readonly code: string,
    public readonly statusCode: number,
  ) {
    super(message);
    Object.setPrototypeOf(this, ScalarError.prototype);
  }
}

export interface ProxyOptions {
  apiSpecUrl: string;
  proxyUrlPath: string;
  app: AzuraClient;
}

export interface SetupDocsRouteOptions extends ScalarConfigType {
  docPath: string;
  proxyUrl: string;
  apiSpecUrl: string;
}
