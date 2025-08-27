-- CreateTable
CREATE TABLE "admin" (
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

-- CreateTable
CREATE TABLE "app_provider" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name_app" TEXT NOT NULL,
    "owner_email" TEXT NOT NULL,
    "public_key" TEXT NOT NULL,
    "secret_key" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "adminId" TEXT NOT NULL,
    CONSTRAINT "app_provider_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admin" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_email_key" ON "admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "app_provider_public_key_key" ON "app_provider"("public_key");

-- CreateIndex
CREATE UNIQUE INDEX "app_provider_secret_key_key" ON "app_provider"("secret_key");
