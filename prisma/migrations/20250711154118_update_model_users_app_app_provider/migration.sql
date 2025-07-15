/*
  Warnings:

  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "users";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "users_app" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "app_providerId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "email_verification_token" TEXT,
    "last_login_at" DATETIME,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "users_app_app_providerId_fkey" FOREIGN KEY ("app_providerId") REFERENCES "app_provider" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
