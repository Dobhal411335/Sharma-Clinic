-- Additive: Postgres-backed login rate limiting for Auth.js Credentials.
CREATE TABLE IF NOT EXISTS "auth_rate_limits" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "lockedUntil" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auth_rate_limits_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "auth_rate_limits_key_key" ON "auth_rate_limits"("key");
CREATE INDEX IF NOT EXISTS "auth_rate_limits_lockedUntil_idx" ON "auth_rate_limits"("lockedUntil");
