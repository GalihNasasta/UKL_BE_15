-- AlterTable
ALTER TABLE `peminjaman` ADD COLUMN `status` ENUM('kembali', 'dipinjam') NOT NULL DEFAULT 'dipinjam';
