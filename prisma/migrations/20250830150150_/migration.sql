/*
  Warnings:

  - You are about to drop the column `count` on the `admin` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_admin" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "last_login_at" DATETIME
);
INSERT INTO "new_admin" ("createdAt", "email", "email_verified", "id", "is_active", "last_login_at", "name", "password_hash", "updatedAt") SELECT "createdAt", "email", "email_verified", "id", "is_active", "last_login_at", "name", "password_hash", "updatedAt" FROM "admin";
DROP TABLE "admin";
ALTER TABLE "new_admin" RENAME TO "admin";
CREATE UNIQUE INDEX "admin_email_key" ON "admin"("email");
CREATE TABLE "new_app_provider" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "public_key" TEXT NOT NULL,
    "secret_key" TEXT NOT NULL,
    "name_app" TEXT NOT NULL,
    "owner_email" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "count_usage" INTEGER NOT NULL DEFAULT 0,
    "last_reset_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
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
