-- CreateTable
CREATE TABLE "app_provider" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "client_id" TEXT NOT NULL,
    "client_secret" TEXT,
    "name_app" TEXT NOT NULL,
    "onwer_email" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
