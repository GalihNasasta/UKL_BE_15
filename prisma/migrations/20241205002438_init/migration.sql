-- AlterTable
ALTER TABLE `peminjaman` MODIFY `status` ENUM('kembali', 'dipinjam', 'tidak_kembali') NOT NULL DEFAULT 'dipinjam';
