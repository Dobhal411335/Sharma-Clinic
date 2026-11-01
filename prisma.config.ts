import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * Prisma 7: datasource URL lives here (not in schema.prisma).
 * process.env is used so `prisma generate` works when DATABASE_URL is unset.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL ?? "",
  },
});
