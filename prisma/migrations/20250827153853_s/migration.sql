-- CreateTable
CREATE TABLE "users_app" (
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

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_app_provider" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "public_key" TEXT NOT NULL,
    "secret_key" TEXT NOT NULL,
    "name_app" TEXT NOT NULL,
    "owner_email" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "count_usage" INTEGER NOT NULL DEFAULT 0,
    "adminId" TEXT,
    CONSTRAINT "app_provider_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admin" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_app_provider" ("adminId", "createdAt", "id", "name_app", "owner_email", "public_key", "secret_key") SELECT "adminId", "createdAt", "id", "name_app", "owner_email", "public_key", "secret_key" FROM "app_provider";
DROP TABLE "app_provider";
ALTER TABLE "new_app_provider" RENAME TO "app_provider";
CREATE UNIQUE INDEX "app_provider_public_key_key" ON "app_provider"("public_key");
CREATE UNIQUE INDEX "app_provider_secret_key_key" ON "app_provider"("secret_key");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "users_app_email_key" ON "users_app"("email");
