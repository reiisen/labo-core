/*
  Warnings:

  - You are about to drop the column `day_of_the_week` on the `Reserve` table. All the data in the column will be lost.
  - You are about to drop the column `day_of_the_week` on the `Schedule` table. All the data in the column will be lost.
  - Added the required column `day` to the `Reserve` table without a default value. This is not possible if the table is not empty.
  - Added the required column `day` to the `Schedule` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Reserve` DROP COLUMN `day_of_the_week`,
    ADD COLUMN `day` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Schedule` DROP COLUMN `day_of_the_week`,
    ADD COLUMN `day` INTEGER NOT NULL;
