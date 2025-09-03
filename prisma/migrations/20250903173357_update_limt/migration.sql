/*
  Warnings:

  - You are about to drop the column `private_key` on the `admin` table. All the data in the column will be lost.

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
    "last_login_at" DATETIME,
    "limit_of_days" INTEGER NOT NULL DEFAULT 100,
    "role" TEXT NOT NULL DEFAULT 'free'
);
INSERT INTO "new_admin" ("createdAt", "email", "email_verified", "id", "is_active", "last_login_at", "name", "password_hash", "role", "updatedAt") SELECT "createdAt", "email", "email_verified", "id", "is_active", "last_login_at", "name", "password_hash", "role", "updatedAt" FROM "admin";
DROP TABLE "admin";
ALTER TABLE "new_admin" RENAME TO "admin";
CREATE UNIQUE INDEX "admin_email_key" ON "admin"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
