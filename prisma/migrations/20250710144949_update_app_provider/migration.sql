/*
  Warnings:

  - You are about to drop the column `client_id` on the `app_provider` table. All the data in the column will be lost.
  - You are about to drop the column `client_secret` on the `app_provider` table. All the data in the column will be lost.
  - Added the required column `public_key` to the `app_provider` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_app_provider" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "public_key" TEXT NOT NULL,
    "secret_key" TEXT,
    "name_app" TEXT NOT NULL,
    "onwer_email" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_app_provider" ("createdAt", "id", "name_app", "onwer_email") SELECT "createdAt", "id", "name_app", "onwer_email" FROM "app_provider";
DROP TABLE "app_provider";
ALTER TABLE "new_app_provider" RENAME TO "app_provider";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
