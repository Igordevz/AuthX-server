/*
  Warnings:

  - A unique constraint covering the columns `[public_key]` on the table `app_provider` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "app_provider_public_key_key" ON "app_provider"("public_key");
