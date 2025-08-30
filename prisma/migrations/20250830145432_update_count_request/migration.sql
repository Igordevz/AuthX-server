/*
  Warnings:

  - Made the column `adminId` on table `app_provider` required. This step will fail if there are existing NULL values in that column.
  - Made the column `owner_email` on table `app_provider` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "admin" ADD COLUMN "count" INTEGER DEFAULT 0;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_app_provider" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "public_key" TEXT NOT NULL,
    "secret_key" TEXT NOT NULL,
    "name_app" TEXT NOT NULL,
    "owner_email" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "count_usage" INTEGER NOT NULL DEFAULT 0,
    "adminId" TEXT NOT NULL,
    CONSTRAINT "app_provider_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admin" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_app_provider" ("adminId", "count_usage", "createdAt", "id", "name_app", "owner_email", "public_key", "secret_key") SELECT "adminId", "count_usage", "createdAt", "id", "name_app", "owner_email", "public_key", "secret_key" FROM "app_provider";
DROP TABLE "app_provider";
ALTER TABLE "new_app_provider" RENAME TO "app_provider";
CREATE UNIQUE INDEX "app_provider_public_key_key" ON "app_provider"("public_key");
CREATE UNIQUE INDEX "app_provider_secret_key_key" ON "app_provider"("secret_key");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
