/*
  Warnings:

  - Added the required column `updatedAt` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_app_provider" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "public_key" TEXT NOT NULL,
    "secret_key" TEXT NOT NULL,
    "name_app" TEXT NOT NULL,
    "onwer_email" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "count_usage" INTEGER NOT NULL DEFAULT 0,
    "userEmail" TEXT,
    CONSTRAINT "app_provider_userEmail_fkey" FOREIGN KEY ("userEmail") REFERENCES "user" ("email") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_app_provider" ("count_usage", "createdAt", "id", "name_app", "onwer_email", "public_key", "secret_key") SELECT "count_usage", "createdAt", "id", "name_app", "onwer_email", "public_key", "secret_key" FROM "app_provider";
DROP TABLE "app_provider";
ALTER TABLE "new_app_provider" RENAME TO "app_provider";
CREATE UNIQUE INDEX "app_provider_public_key_key" ON "app_provider"("public_key");
CREATE UNIQUE INDEX "app_provider_secret_key_key" ON "app_provider"("secret_key");
CREATE TABLE "new_user" (
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
INSERT INTO "new_user" ("email", "id", "name", "password_hash") SELECT "email", "id", "name", "password_hash" FROM "user";
DROP TABLE "user";
ALTER TABLE "new_user" RENAME TO "user";
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
