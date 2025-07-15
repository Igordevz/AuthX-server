-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_app_provider" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "public_key" TEXT NOT NULL,
    "secret_key" TEXT,
    "name_app" TEXT NOT NULL,
    "onwer_email" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "count" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_app_provider" ("createdAt", "id", "name_app", "onwer_email", "public_key", "secret_key") SELECT "createdAt", "id", "name_app", "onwer_email", "public_key", "secret_key" FROM "app_provider";
DROP TABLE "app_provider";
ALTER TABLE "new_app_provider" RENAME TO "app_provider";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
