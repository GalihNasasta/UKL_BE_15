/*
  Warnings:

  - You are about to drop the column `tanggal_kembali` on the `peminjaman` table. All the data in the column will be lost.
  - You are about to drop the column `tanggal_pinjam` on the `peminjaman` table. All the data in the column will be lost.
  - Added the required column `tgl_pinjam` to the `Peminjaman` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `peminjaman` DROP COLUMN `tanggal_kembali`,
    DROP COLUMN `tanggal_pinjam`,
    ADD COLUMN `tgl_kembali` DATE NULL,
    ADD COLUMN `tgl_pinjam` DATE NOT NULL;
