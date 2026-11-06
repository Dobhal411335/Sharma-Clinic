-- Admin CMS documents for sidebar screens. One clinic, no site table.

CREATE TABLE "cms_singletons" (
    "key" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cms_singletons_pkey" PRIMARY KEY ("key")
);

CREATE TABLE "cms_items" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cms_items_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "cms_items_kind_sortOrder_idx" ON "cms_items"("kind", "sortOrder");
