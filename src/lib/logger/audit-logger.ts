import { logger } from "./logger";
import { sanitizeForLogging } from "./sanitizers";
import type { AuditEventInput, AuditLogRecord } from "./types";

/**
 * Append-only audit persistence.
 *
 * Authorization note: Doctors must never read platform/admin audit rows.
 * Do not expose a public admin audit API from this module — callers that
 * query AuditLog must enforce ADMIN-only access in their own service layer.
 */

type AuditLogDelegate = {
  create: (args: {
    data: {
      actorUserId?: string | null;
      action: string;
      entityType: string;
      entityId: string;
      metadata?: unknown;
    };
  }) => Promise<{
    id: string;
    actorUserId: string | null;
    action: string;
    entityType: string;
    entityId: string;
    metadata: unknown;
    createdAt: Date;
  }>;
};

export type AuditPrismaClient = {
  auditLog: AuditLogDelegate;
};

let prismaOverride: AuditPrismaClient | null = null;

/** Test helper — inject a mock Prisma client. */
export function setAuditPrismaClientForTests(
  client: AuditPrismaClient | null,
): void {
  prismaOverride = client;
}

async function resolvePrisma(): Promise<AuditPrismaClient> {
  if (prismaOverride) {
    return prismaOverride;
  }

  const { db } = await import("@/lib/db/prisma");
  return db as unknown as AuditPrismaClient;
}

function assertSafeAuditFields(input: AuditEventInput): void {
  if (!input.action?.trim()) {
    throw new Error("Audit action is required.");
  }
  if (!input.entityType?.trim()) {
    throw new Error("Audit entityType is required.");
  }
  if (!input.entityId?.trim()) {
    throw new Error("Audit entityId is required.");
  }
}

/**
 * Persist an append-only audit event and optionally mirror a safe INFO marker
 * into application logs. Never stores passwords, tokens, payment secrets, or
 * medical/patient bodies.
 */
export async function logAuditEvent(
  input: AuditEventInput,
): Promise<AuditLogRecord | null> {
  try {
    assertSafeAuditFields(input);

    const metadata =
      input.metadata == null
        ? undefined
        : sanitizeForLogging(input.metadata);

    const prisma = await resolvePrisma();
    const row = await prisma.auditLog.create({
      data: {
        actorUserId: input.actorUserId ?? null,
        action: input.action.trim(),
        entityType: input.entityType.trim(),
        entityId: input.entityId.trim(),
        ...(metadata !== undefined ? { metadata } : {}),
      },
    });

    const record: AuditLogRecord = {
      id: row.id,
      actorUserId: row.actorUserId,
      action: row.action,
      entityType: row.entityType,
      entityId: row.entityId,
      metadata: row.metadata,
      createdAt: row.createdAt,
    };

    if (input.mirrorToAppLogs !== false) {
      try {
        logger.info("Audit event recorded", {
          module: "audit",
          function: "logAuditEvent",
          userId: record.actorUserId ?? undefined,
          auditId: record.id,
          action: record.action,
          entityType: record.entityType,
          entityId: record.entityId,
        });
      } catch {
        // mirroring must not fail the write
      }
    }

    return record;
  } catch (error) {
    // Audit write failures must be visible but must not crash the request path.
    try {
      logger.error("Failed to persist audit event", {
        module: "audit",
        function: "logAuditEvent",
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        errorCode: "AUDIT_PERSIST_FAILED",
        errorName: error instanceof Error ? error.name : "UnknownError",
      });
    } catch {
      // ignore
    }
    return null;
  }
}
