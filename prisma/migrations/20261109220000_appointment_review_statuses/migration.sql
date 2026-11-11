-- Expand appointment review lifecycle: after payment → PENDING; admin → ACCEPTED|DECLINED.
-- Migrate legacy CONFIRMED → ACCEPTED.
-- Prisma DateTime → TIMESTAMP(3); use tsrange (not tstzrange) for EXCLUDE.

ALTER TABLE "appointments" DROP CONSTRAINT IF EXISTS "appointments_doctor_time_excl";

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'AppointmentStatus_new'
  ) THEN
    -- Partial prior attempt cleanup
    NULL;
  ELSE
    CREATE TYPE "AppointmentStatus_new" AS ENUM (
      'PENDING_PAYMENT',
      'PENDING',
      'ACCEPTED',
      'DECLINED',
      'CANCELLED',
      'COMPLETED',
      'NO_SHOW',
      'EXPIRED'
    );
  END IF;
END $$;

ALTER TABLE "appointments"
  ALTER COLUMN "status" DROP DEFAULT;

-- Only rewrite if old enum still in use
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_attribute a
    JOIN pg_class c ON c.oid = a.attrelid
    JOIN pg_type t ON t.oid = a.atttypid
    WHERE c.relname = 'appointments'
      AND a.attname = 'status'
      AND t.typname = 'AppointmentStatus'
  ) AND EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'AppointmentStatus' AND e.enumlabel = 'CONFIRMED'
  ) THEN
    ALTER TABLE "appointments"
      ALTER COLUMN "status" TYPE "AppointmentStatus_new"
      USING (
        CASE
          WHEN "status"::text = 'CONFIRMED' THEN 'ACCEPTED'::"AppointmentStatus_new"
          ELSE "status"::text::"AppointmentStatus_new"
        END
      );
    DROP TYPE "AppointmentStatus";
    ALTER TYPE "AppointmentStatus_new" RENAME TO "AppointmentStatus";
  ELSIF EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'AppointmentStatus_new'
  ) THEN
    -- Already converted or mid-flight: ensure column uses final enum name
    IF EXISTS (
      SELECT 1
      FROM pg_attribute a
      JOIN pg_class c ON c.oid = a.attrelid
      JOIN pg_type t ON t.oid = a.atttypid
      WHERE c.relname = 'appointments'
        AND a.attname = 'status'
        AND t.typname = 'AppointmentStatus_new'
    ) THEN
      DROP TYPE IF EXISTS "AppointmentStatus";
      ALTER TYPE "AppointmentStatus_new" RENAME TO "AppointmentStatus";
    END IF;
  END IF;
END $$;

ALTER TABLE "appointments"
  ALTER COLUMN "status" SET DEFAULT 'PENDING_PAYMENT'::"AppointmentStatus";

ALTER TABLE "appointments"
  DROP CONSTRAINT IF EXISTS "appointments_doctor_time_excl";

ALTER TABLE "appointments"
  ADD CONSTRAINT "appointments_doctor_time_excl"
  EXCLUDE USING gist (
    "doctorId" WITH =,
    tsrange("startsAt", "endsAt", '[)') WITH &&
  )
  WHERE ("status" IN ('PENDING_PAYMENT', 'PENDING', 'ACCEPTED'));
