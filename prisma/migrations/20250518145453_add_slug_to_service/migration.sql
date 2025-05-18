/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Service` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Service` table without a default value. This is not possible if the table is not empty.

*/
-- First add the column as nullable
ALTER TABLE `Service` ADD COLUMN `slug` VARCHAR(191) NULL;

-- Update existing records with slugified names
UPDATE `Service` SET `slug` = LOWER(REPLACE(`name`, ' ', '-')) WHERE `slug` IS NULL;

-- Now make the column NOT NULL
ALTER TABLE `Service` MODIFY `slug` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Service_slug_key` ON `Service`(`slug`);
