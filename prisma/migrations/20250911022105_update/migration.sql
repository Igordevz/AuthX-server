/*
  Warnings:

  - You are about to drop the column `secret_key` on the `app_provider` table. All the data in the column will be lost.
  - You are about to drop the column `secret_key` on the `users_app` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_app_provider" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "public_key" TEXT NOT NULL,
    "description" TEXT,
    "name_app" TEXT NOT NULL,
    "owner_email" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "count_usage" INTEGER NOT NULL DEFAULT 0,
    "last_reset_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "adminId" TEXT NOT NULL,
    "api_calls" INTEGER DEFAULT 0,
    CONSTRAINT "app_provider_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admin" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_app_provider" ("adminId", "api_calls", "count_usage", "createdAt", "description", "id", "last_reset_at", "name_app", "owner_email", "public_key") SELECT "adminId", "api_calls", "count_usage", "createdAt", "description", "id", "last_reset_at", "name_app", "owner_email", "public_key" FROM "app_provider";
DROP TABLE "app_provider";
ALTER TABLE "new_app_provider" RENAME TO "app_provider";
CREATE UNIQUE INDEX "app_provider_public_key_key" ON "app_provider"("public_key");
CREATE TABLE "new_users_app" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "public_key" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "email_verification_token" TEXT,
    "last_login_at" DATETIME,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "users_app_public_key_fkey" FOREIGN KEY ("public_key") REFERENCES "app_provider" ("public_key") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_users_app" ("createdAt", "email", "email_verification_token", "email_verified", "id", "is_active", "last_login_at", "name", "password_hash", "updatedAt") SELECT "createdAt", "email", "email_verification_token", "email_verified", "id", "is_active", "last_login_at", "name", "password_hash", "updatedAt" FROM "users_app";
DROP TABLE "users_app";
ALTER TABLE "new_users_app" RENAME TO "users_app";
CREATE UNIQUE INDEX "users_app_email_public_key_key" ON "users_app"("email", "public_key");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
