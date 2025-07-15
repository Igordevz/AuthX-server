/*
  Warnings:

  - You are about to drop the column `app_providerId` on the `users_app` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[secret_key]` on the table `app_provider` will be added. If there are existing duplicate values, this will fail.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users_app" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "secret_key" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "email_verification_token" TEXT,
    "last_login_at" DATETIME,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "users_app_secret_key_fkey" FOREIGN KEY ("secret_key") REFERENCES "app_provider" ("secret_key") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_users_app" ("createdAt", "email", "email_verification_token", "email_verified", "id", "is_active", "last_login_at", "name", "password_hash", "updatedAt") SELECT "createdAt", "email", "email_verification_token", "email_verified", "id", "is_active", "last_login_at", "name", "password_hash", "updatedAt" FROM "users_app";
DROP TABLE "users_app";
ALTER TABLE "new_users_app" RENAME TO "users_app";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "app_provider_secret_key_key" ON "app_provider"("secret_key");
