import { prisma } from "../src/lib/db/prisma.ts";

const enums = await prisma.$queryRawUnsafe<Array<{ typname: string }>>(
  `SELECT t.typname FROM pg_type t WHERE t.typname LIKE 'AppointmentStatus%'`,
);
const cons = await prisma.$queryRawUnsafe<
  Array<{ conname: string; def: string }>
>(
  `SELECT conname, pg_get_constraintdef(oid) AS def FROM pg_constraint WHERE conname LIKE '%appointment%'`,
);
const sample = await prisma.$queryRawUnsafe<Array<{ status: string }>>(
  `SELECT status::text AS status FROM appointments LIMIT 5`,
);
console.log(JSON.stringify({ enums, cons, sample }, null, 2));
await prisma.$disconnect();
