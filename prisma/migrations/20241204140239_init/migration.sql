/*
  Warnings:

  - Added the required column `quantity` to the `Peminjaman` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `peminjaman` ADD COLUMN `quantity` INTEGER NOT NULL;
