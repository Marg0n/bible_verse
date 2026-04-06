/*
  Warnings:

  - The `lastActiveDate` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "theme" TEXT NOT NULL DEFAULT 'light',
DROP COLUMN "lastActiveDate",
ADD COLUMN     "lastActiveDate" TIMESTAMP(3);
