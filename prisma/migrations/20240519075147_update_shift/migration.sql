/*
  Warnings:

  - You are about to drop the column `shift` on the `Wedding` table. All the data in the column will be lost.
  - Added the required column `shift_id` to the `Wedding` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Wedding` DROP COLUMN `shift`,
    ADD COLUMN `shift_id` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `Shift` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Wedding_Shift_id_fkey` ON `Wedding`(`shift_id`);

-- AddForeignKey
ALTER TABLE `Wedding` ADD CONSTRAINT `Wedding_shift_id_fkey` FOREIGN KEY (`shift_id`) REFERENCES `Shift`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
