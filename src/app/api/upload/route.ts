import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth/config";
import { hasRole } from "@/lib/auth/authorization";
import {
  CloudinaryError,
  deleteSingleImage,
  deleteSinglePdf,
  uploadMultipleImages,
  uploadSingleImage,
  uploadSinglePdf,
  type DeleteResourceType,
  type UploadOperationType,
} from "@/lib/cloudinary";
import {
  REQUEST_ID_HEADER,
  getRequestId,
  logError,
  setRequestUser,
  withRequestLogging,
} from "@/lib/logger";

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
  data: T;
};

const UPLOAD_TYPES: readonly UploadOperationType[] = [
  "single-image",
  "multiple-images",
  "single-pdf",
] as const;

const DELETE_TYPES: readonly DeleteResourceType[] = ["image", "pdf"] as const;

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

function jsonSuccess<T>(data: T, status = 200): NextResponse<ApiSuccessBody<T>> {
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

async function requireAdmin(): Promise<
  | { ok: true }
  | { ok: false; response: NextResponse<ApiErrorBody> }
> {
  // Fail-closed: until Auth.js credentials/session wiring is complete,
  // missing or non-ADMIN sessions are rejected.
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return {
      ok: false,
      response: jsonError(401, "UNAUTHORIZED", "Authentication required."),
    };
  }

  if (!hasRole(session, "ADMIN")) {
    return {
      ok: false,
      response: jsonError(403, "FORBIDDEN", "Admin access required."),
    };
  }

  setRequestUser(session.user.id, session.user.role);
  return { ok: true };
}

function isUploadOperationType(value: string): value is UploadOperationType {
  return (UPLOAD_TYPES as readonly string[]).includes(value);
}

function isDeleteResourceType(value: string): value is DeleteResourceType {
  return (DELETE_TYPES as readonly string[]).includes(value);
}

function getSingleFile(formData: FormData, fieldName: string): File | null {
  const value = formData.get(fieldName);
  return value instanceof File ? value : null;
}

function getMultipleFiles(formData: FormData, fieldName: string): File[] {
  return formData
    .getAll(fieldName)
    .filter((value): value is File => value instanceof File && value.size >= 0);
}

function handleCloudinaryError(error: unknown): NextResponse<ApiErrorBody> {
  logError(error, {
    module: "upload",
    function: "handleCloudinaryError",
  });

  if (error instanceof CloudinaryError) {
    return jsonError(error.statusCode, error.code, error.message);
  }

  return jsonError(500, "INTERNAL_ERROR", "Media operation failed.");
}

async function postHandler(request: Request): Promise<Response> {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return auth.response;
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return jsonError(400, "INVALID_FORM_DATA", "Expected multipart/form-data.");
  }

  const typeValue = formData.get("type");
  if (typeof typeValue !== "string" || !isUploadOperationType(typeValue)) {
    return jsonError(
      400,
      "INVALID_UPLOAD_TYPE",
      "type must be one of: single-image, multiple-images, single-pdf.",
    );
  }

  try {
    switch (typeValue) {
      case "single-image": {
        const file = getSingleFile(formData, "file");
        if (!file) {
          return jsonError(400, "FILE_REQUIRED", "file is required.");
        }

        const data = await uploadSingleImage(file);
        return jsonSuccess(data, 201);
      }

      case "multiple-images": {
        const files = getMultipleFiles(formData, "files");
        if (files.length === 0) {
          return jsonError(
            400,
            "FILES_REQUIRED",
            "At least one files entry is required.",
          );
        }

        const data = await uploadMultipleImages(files);
        const status =
          data.successful.length === 0
            ? 400
            : data.failed.length > 0
              ? 207
              : 201;

        return jsonSuccess(data, status);
      }

      case "single-pdf": {
        const file = getSingleFile(formData, "file");
        if (!file) {
          return jsonError(400, "FILE_REQUIRED", "file is required.");
        }

        const data = await uploadSinglePdf(file);
        return jsonSuccess(data, 201);
      }
    }
  } catch (error) {
    return handleCloudinaryError(error);
  }
}

async function deleteHandler(request: Request): Promise<Response> {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return auth.response;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "INVALID_JSON", "Expected a JSON body.");
  }

  if (!body || typeof body !== "object") {
    return jsonError(400, "INVALID_BODY", "Invalid delete payload.");
  }

  const payload = body as Record<string, unknown>;
  const typeValue = payload.type;
  const keyValue = payload.key;

  if (typeof typeValue !== "string" || !isDeleteResourceType(typeValue)) {
    return jsonError(
      400,
      "INVALID_DELETE_TYPE",
      "type must be one of: image, pdf.",
    );
  }

  if (typeof keyValue !== "string" || !keyValue.trim()) {
    return jsonError(400, "KEY_REQUIRED", "key (Cloudinary public_id) is required.");
  }

  try {
    const data =
      typeValue === "image"
        ? await deleteSingleImage(keyValue)
        : await deleteSinglePdf(keyValue);

    if (!data.success) {
      return jsonSuccess(data, 404);
    }

    return jsonSuccess(data);
  } catch (error) {
    return handleCloudinaryError(error);
  }
}

export const POST = withRequestLogging(postHandler, { api: "upload" });
export const DELETE = withRequestLogging(deleteHandler, { api: "upload" });
