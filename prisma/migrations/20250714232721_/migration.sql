/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `users_app` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "users_app_email_key" ON "users_app"("email");
