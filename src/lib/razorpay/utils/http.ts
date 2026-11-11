import { NextResponse } from "next/server";

import {
  REQUEST_ID_HEADER,
  getRequestId,
  logExternalServiceError,
} from "@/lib/logger";

import { sanitizeProviderError } from "../client";
import { RazorpayIntegrationError } from "../types";

export type ApiErrorBody = {
  success: false;
  error: {
    code: string;
    message: string;
    requestId?: string;
  };
};

export type ApiSuccessBody<T> = {
  success: true;
  data: T;
};

function withRequestIdHeader<T>(response: NextResponse<T>): NextResponse<T> {
  const requestId = getRequestId();
  if (requestId) {
    response.headers.set(REQUEST_ID_HEADER, requestId);
  }
  return response;
}

export function jsonError(
  status: number,
  code: string,
  message: string,
): NextResponse<ApiErrorBody> {
  const requestId = getRequestId();
  return withRequestIdHeader(
    NextResponse.json<ApiErrorBody>(
      {
        success: false,
        error: {
          code,
          message,
          ...(requestId ? { requestId } : {}),
        },
      },
      { status },
    ),
  );
}

export function jsonSuccess<T>(
  data: T,
  status = 200,
): NextResponse<ApiSuccessBody<T>> {
  return withRequestIdHeader(
    NextResponse.json<ApiSuccessBody<T>>(
      {
        success: true,
        data,
      },
      { status },
    ),
  );
}

export function handleRazorpayRouteError(
  error: unknown,
): NextResponse<ApiErrorBody> {
  logExternalServiceError("razorpay", error, {
    module: "razorpay",
    function: "handleRazorpayRouteError",
  });

  if (error instanceof RazorpayIntegrationError) {
    return jsonError(error.statusCode, error.code, error.message);
  }

  const sanitized = sanitizeProviderError(error);
  return jsonError(sanitized.statusCode, sanitized.code, sanitized.message);
}

export function clientIpFromRequest(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) {
      return first;
    }
  }

  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) {
    return realIp;
  }

  return "unknown";
}
