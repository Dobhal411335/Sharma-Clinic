import { NextResponse } from "next/server";

import {
  REQUEST_ID_HEADER,
  createRequestStore,
  resolveRequestId,
  runWithRequestContextAsync,
  updateRequestStore,
} from "./context";
import { logError, toClientErrorBody } from "./error-logger";
import { logger } from "./logger";
import { logPerformance } from "./performance-logger";
import { sanitizeForLogging } from "./sanitizers";
import type { LogRequestOptions, LogResponseOptions } from "./types";

export function logRequest(options: LogRequestOptions): void {
  try {
    logger.info("HTTP request started", {
      method: options.method,
      route: options.route,
      api: options.api ?? options.route,
      userId: options.userId,
      userRole: options.userRole,
      ...(options.meta
        ? { meta: sanitizeForLogging(options.meta) as Record<string, unknown> }
        : {}),
    });
  } catch {
    // never crash
  }
}

export function logResponse(options: LogResponseOptions): void {
  try {
    const level =
      options.statusCode >= 500
        ? "error"
        : options.statusCode >= 400
          ? "warn"
          : "info";

    const message = "HTTP request completed";
    const bindings = {
      method: options.method,
      route: options.route,
      api: options.api ?? options.route,
      statusCode: options.statusCode,
      durationMs: options.durationMs,
      ...(options.meta
        ? { meta: sanitizeForLogging(options.meta) as Record<string, unknown> }
        : {}),
    };

    if (level === "error") {
      logger.error(message, bindings);
    } else if (level === "warn") {
      logger.warn(message, bindings);
    } else {
      logger.info(message, bindings);
    }

    logPerformance({
      operation: `${options.method} ${options.route}`,
      durationMs: options.durationMs,
      kind: "request",
      module: "http",
    });
  } catch {
    // never crash
  }
}

function attachRequestIdHeader(
  response: Response,
  requestId: string,
): Response {
  try {
    response.headers.set(REQUEST_ID_HEADER, requestId);
  } catch {
    // immutable headers — clone
    const headers = new Headers(response.headers);
    headers.set(REQUEST_ID_HEADER, requestId);
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }
  return response;
}

function routeFromRequest(request: Request): string {
  try {
    return new URL(request.url).pathname;
  } catch {
    return "unknown";
  }
}

export type ApiRouteContext = {
  params?: Promise<Record<string, string | string[]>> | Record<string, string | string[]>;
};

export type ApiRouteHandler = (
  request: Request,
  context: ApiRouteContext,
) => Promise<Response> | Response;

export interface WithRequestLoggingOptions {
  /** Logical API name for logs, e.g. "upload" or "payments.create-order". */
  api?: string;
  /** When true, uncaught errors become JSON 500 with requestId (default true). */
  catchErrors?: boolean;
}

/**
 * Wrap a Next.js App Router handler with request correlation + timing logs.
 * Sets `x-request-id` on the response. Propagates context via AsyncLocalStorage.
 */
export function withRequestLogging(
  handler: ApiRouteHandler,
  options: WithRequestLoggingOptions = {},
): ApiRouteHandler {
  const catchErrors = options.catchErrors !== false;

  return async (request, context) => {
    const incoming = request.headers.get(REQUEST_ID_HEADER);
    const requestId = resolveRequestId(incoming);
    const method = request.method;
    const route = routeFromRequest(request);
    const api = options.api ?? route;
    const store = createRequestStore({
      requestId,
      method,
      route,
      api,
    });

    return runWithRequestContextAsync(store, async () => {
      logRequest({ method, route, api });

      try {
        const response = await handler(request, context);
        const durationMs = Date.now() - store.startedAt;
        logResponse({
          method,
          route,
          api,
          statusCode: response.status,
          durationMs,
        });
        return attachRequestIdHeader(response, requestId);
      } catch (error) {
        const durationMs = Date.now() - store.startedAt;
        logError(error, {
          module: "http",
          endpoint: api,
          function: "withRequestLogging",
          durationMs,
        });
        logResponse({
          method,
          route,
          api,
          statusCode: 500,
          durationMs,
        });

        if (!catchErrors) {
          throw error;
        }

        const body = toClientErrorBody(error);
        const response = NextResponse.json(body, { status: 500 });
        response.headers.set(REQUEST_ID_HEADER, requestId);
        return response;
      }
    });
  };
}

/**
 * Helper for handlers that resolve session after entry — patch ALS user fields.
 */
export function setRequestUser(userId?: string, userRole?: string): void {
  updateRequestStore({
    ...(userId ? { userId } : {}),
    ...(userRole ? { userRole } : {}),
  });
}
