import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { auth } from "@/auth";
import { isAdmin } from "@/lib/auth/permissions";

export function jsonData<T>(data: T, message: string, status = 200): NextResponse {
  return NextResponse.json({ success: true, message, data }, { status });
}

export function jsonMessage(status: number, message: string): NextResponse {
  return NextResponse.json({ success: false, message }, { status });
}

export async function requireCmsAdmin(): Promise<
  | { ok: true; userId: string }
  | { ok: false; response: NextResponse }
> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, response: jsonMessage(401, "Authentication required.") };
  }
  if (!isAdmin(session.user)) {
    return { ok: false, response: jsonMessage(403, "Admin access required.") };
  }
  return { ok: true, userId: session.user.id };
}

export async function readJson(request: Request): Promise<
  | { ok: true; body: unknown }
  | { ok: false; response: NextResponse }
> {
  try {
    return { ok: true, body: await request.json() };
  } catch {
    return { ok: false, response: jsonMessage(400, "Expected a JSON body.") };
  }
}

export function zodMessage(error: ZodError): string {
  return error.issues[0]?.message ?? "The request could not be processed.";
}

export function requestId(request: Request): string | null {
  return new URL(request.url).searchParams.get("id");
}
