/*
  Warnings:

  - You are about to drop the column `app_providerId` on the `admin` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_admin" (
    "id" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "email_verification_token" TEXT,
    "last_login_at" DATETIME,
    "email_verified" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_admin" ("createdAt", "email", "email_verification_token", "email_verified", "id", "is_active", "last_login_at", "name", "password_hash", "updatedAt") SELECT "createdAt", "email", "email_verification_token", "email_verified", "id", "is_active", "last_login_at", "name", "password_hash", "updatedAt" FROM "admin";
DROP TABLE "admin";
ALTER TABLE "new_admin" RENAME TO "admin";
CREATE UNIQUE INDEX "admin_id_key" ON "admin"("id");
CREATE UNIQUE INDEX "admin_email_key" ON "admin"("email");
CREATE TABLE "new_app_provider" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "public_key" TEXT NOT NULL,
    "secret_key" TEXT NOT NULL,
    "name_app" TEXT NOT NULL,
    "onwer_email" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "count_usage" INTEGER NOT NULL DEFAULT 0,
    "userEmail" TEXT,
    CONSTRAINT "app_provider_userEmail_fkey" FOREIGN KEY ("userEmail") REFERENCES "admin" ("email") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_app_provider" ("count_usage", "createdAt", "id", "name_app", "onwer_email", "public_key", "secret_key", "userEmail") SELECT "count_usage", "createdAt", "id", "name_app", "onwer_email", "public_key", "secret_key", "userEmail" FROM "app_provider";
DROP TABLE "app_provider";
ALTER TABLE "new_app_provider" RENAME TO "app_provider";
CREATE UNIQUE INDEX "app_provider_public_key_key" ON "app_provider"("public_key");
CREATE UNIQUE INDEX "app_provider_secret_key_key" ON "app_provider"("secret_key");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
