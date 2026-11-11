import { NextResponse } from "next/server";

import {
  CloudinaryError,
  uploadMedicalHistoryImage,
} from "@/lib/cloudinary";
import {
  REQUEST_ID_HEADER,
  getRequestId,
  logError,
  withRequestLogging,
} from "@/lib/logger";
import { clientIpFromRequest } from "@/lib/razorpay/utils/http";
import { checkRateLimit } from "@/lib/razorpay/utils/rate-limit";

type ApiErrorBody = {
  success: false;
  error: {
    code: string;
    message: string;
    requestId?: string;
  };
};

type ApiSuccessBody<T> = {
  success: true;
  message: string;
  data: T;
};

const RATE_LIMIT = { limit: 15, windowMs: 60_000 } as const;

function withRequestIdHeader<T>(response: NextResponse<T>): NextResponse<T> {
  const requestId = getRequestId();
  if (requestId) {
    response.headers.set(REQUEST_ID_HEADER, requestId);
  }
  return response;
}

function jsonError(
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

function jsonSuccess<T>(
  data: T,
  message: string,
  status = 200,
): NextResponse<ApiSuccessBody<T>> {
  return withRequestIdHeader(
    NextResponse.json<ApiSuccessBody<T>>(
      {
        success: true,
        message,
        data,
      },
      { status },
    ),
  );
}

async function postHandler(request: Request): Promise<Response> {
  const ip = clientIpFromRequest(request);
  const limited = checkRateLimit({
    key: `public-medical-history-upload:${ip}`,
    ...RATE_LIMIT,
  });
  if (!limited.allowed) {
    return jsonError(
      429,
      "RATE_LIMITED",
      `Too many uploads. Retry after ${limited.retryAfterSec}s.`,
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return jsonError(400, "INVALID_FORM_DATA", "Expected multipart/form-data.");
  }

  const value = formData.get("file");
  if (!(value instanceof File) || value.size <= 0) {
    return jsonError(400, "FILE_REQUIRED", "file is required.");
  }

  try {
    const uploaded = await uploadMedicalHistoryImage(value);
    return jsonSuccess(
      {
        url: uploaded.secureUrl || uploaded.url,
        publicId: uploaded.publicId,
      },
      "Medical history image uploaded.",
      201,
    );
  } catch (error) {
    logError(error, {
      module: "public.uploads.medical-history",
      function: "postHandler",
    });

    if (error instanceof CloudinaryError) {
      return jsonError(error.statusCode, error.code, error.message);
    }

    return jsonError(500, "UPLOAD_FAILED", "Could not upload medical history image.");
  }
}

export const POST = withRequestLogging(postHandler, {
  api: "public.uploads.medical-history",
});
