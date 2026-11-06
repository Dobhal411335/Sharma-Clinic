import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * Prisma 7: datasource URL lives here (not in schema.prisma).
 * process.env is used so `prisma generate` works when DATABASE_URL is unset.
 * Production (Coolify): set DATABASE_URL and apply migrations with
 * `npm run prisma:migrate:deploy` only — never migrate reset / force-reset.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL ?? "",
  },
});
