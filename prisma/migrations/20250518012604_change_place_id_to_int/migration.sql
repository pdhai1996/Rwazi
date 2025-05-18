/*
  Warnings:

  - You are about to alter the column `place_id` on the `Favorite` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - The primary key for the `Place` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `Place` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- DropForeignKey
ALTER TABLE `Favorite` DROP FOREIGN KEY `Favorite_place_id_fkey`;

-- DropIndex
DROP INDEX `Favorite_place_id_fkey` ON `Favorite`;

-- AlterTable
ALTER TABLE `Favorite` MODIFY `place_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Place` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AddForeignKey
ALTER TABLE `Favorite` ADD CONSTRAINT `Favorite_place_id_fkey` FOREIGN KEY (`place_id`) REFERENCES `Place`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
