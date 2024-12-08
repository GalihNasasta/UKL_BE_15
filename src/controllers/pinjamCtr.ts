import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { allow, date, number } from "joi";
import { setDefaultAutoSelectFamilyAttemptTimeout } from "net";
import { group } from "console";

const prisma = new PrismaClient({ errorFormat: "pretty" });

export const getAllPinjam = async (req: Request, res: Response) => {
    try {
        const AllPinjam = await prisma.peminjaman.findMany({
            include: {
                user: true,
                barang: true
            }
        })

        return res.json({
            status: true,
            message: `berhasil tampil data peminjaman`,
            data: AllPinjam
        }).status(200)
    } catch (error) {
        return res.json({
            status: false,
            message: `gagal tampil data peminjaman`
        }).status(400)
    }
}

// P E M I N J A M A N //

export const pinjamBarang = async (req: Request, res: Response) => {
    try {
        const { user_id, barang_id, tgl_pinjam, tgl_kembali } = req.body
        const qty = 1

        const findUser = await prisma.user.findFirst({
            where: { id: Number(user_id) }
        })
        if (!findUser) {
            return res.json({
                status: false,
                message: `Gak nemu Id user nih. ${user_id}`
            })
        }

        const findBrg = await prisma.barang.findFirst({
            where: { id: Number(barang_id) }
        })
        if (!findBrg) {
            return res.json({
                status: false,
                message: `Gak nemu Id barang nih. ${barang_id}`
            }).status(400)
        }

        const brg = await prisma.barang.findUnique({
            where: { id: Number(barang_id) },
            select: { quantity: true }
        })
        if (!brg || brg.quantity === 0) {
            return res.json({
                status: false,
                message: `Stoknya habis kak.`
            })
        }

        const newBorrow = await prisma.peminjaman.create({
            data: {
                user_id: Number(user_id),
                barang_id: Number(barang_id),
                quantity: Number(qty),
                tgl_pinjam: new Date(tgl_pinjam),
                tgl_kembali: new Date(tgl_kembali)
            }
        })

        const updateBrg = await prisma.barang.update({
            where: {
                id: Number(barang_id)
            },
            data: {
                quantity: {
                    decrement: Number(qty)
                }
            }
        })

        return res.json({
            status: true,
            message: `Berhasil catat peminjaman`,
            data: newBorrow
        }).status(200)
    } catch (error) {
        return res.json({
            status: false,
            message: `Gagal catat peminjaman.                                              ${(error as Error).message}`
        }).status(400)
    }
}

// R E T U R N //

export const returnBrg = async (req: Request, res: Response) => {
    try {
        const { id, tgl_kembali, quantity, status } = req.body

        const pinjam = await prisma.peminjaman.findUnique({
            where: { id: Number(id) },
            select: { quantity: true, barang_id: true, status: true, tgl_kembali: true, tgl_pinjam:true }
        })
        if (!pinjam) {
            return res.json({
                status: false,
                message: `Gak ketemu data pinjeman`
            }).status(404)
        }
        if (pinjam.status === 'kembali') {
            return res.json({
                status: false,
                message: `Barang sudah dikembalikan. 🙏`
            }).status(400)
        }

        const updatePinjam = await prisma.peminjaman.update({
            where: { id: Number(id) },
            data: {
                tgl_kembali: new Date(tgl_kembali),
                status: status
            }
        })

        const updateBrg = await prisma.barang.update({
            where: { id: Number(pinjam.barang_id) },
            data: {
                quantity: {
                    increment: pinjam.quantity
                }
            }
        })

        return res.json({
            status: true,
            message: `Berhasil mengembalikan barang 🤟😜🤟`,
            data: updatePinjam
        }).status(200)
    } catch (error) {
        return res.json({
            status: false,
            message: `Gagal mengembalikan barang.`
        }).status(400)
    }
}

// A N A L I S I S //

export const analisis = async (req: Request, res: Response) => {
    const { tgl_mulai, tgl_akhir, group_by } = req.body

    if (!tgl_mulai || !tgl_akhir || !group_by) {
        return res.json({
            status: false,
            message: `Harus isi tanggal mulai, tanggal akhir, dan group by`
        }).status(400)
    }

    const tanggalMulai = new Date(tgl_mulai)
    const tanggalAkhir = new Date(tgl_akhir)

    if (isNaN(tanggalMulai.getTime()) || isNaN(tanggalAkhir.getTime())) {
        return res.json({
            status: false,
            message: `Format tanggal tidak sah`
        }).status(400)
    }

    try {
        let usage_report
        let info_tambahan: Array<{ id: number, [key: string]: any }> = []

        if (group_by === 'kategori') {
            usage_report = await prisma.peminjaman.groupBy({
                by: ['barang_id'],
                where: {
                    tgl_pinjam: {
                        gte: tanggalMulai
                    }
                },
                _count: {
                    barang_id: true
                },
                _sum: {
                    quantity: true
                }
            })

            const ids = usage_report.map(peminjaman => peminjaman.barang_id)
            info_tambahan = await prisma.barang.findMany({
                where: {
                    id: { in: ids }
                },
                select: { id: true, kategori: true }
            })

        } else if (group_by === 'lokasi') {
            usage_report = await prisma.peminjaman.groupBy({
                by: ['barang_id'],
                where: {
                    tgl_pinjam: {
                        gte: tanggalMulai
                    }
                },
                _count: {
                    barang_id: true
                },
                _sum: {
                    quantity: true
                }
            })

            const ids = usage_report.map(barang => barang.barang_id)
            info_tambahan = await prisma.barang.findMany({
                where: {
                    id: { in: ids }
                },
                select: { id: true, lokasi: true }
            })
        } else {
            return res.json({
                status: false,
                message: `Kriteria groupBy tidak sah, coba menggunakan "kategori" atau "lokasi"`
            }).status(400)
        }

        const returnedItems = await prisma.peminjaman.groupBy({
            by: ['barang_id'],
            where: {
                tgl_pinjam: {
                    gte: tanggalMulai,
                },
                tgl_kembali: {
                    gte: tanggalMulai,
                    lte: tanggalAkhir
                },
                status: 'kembali'
            },
            _count: {
                barang_id: true,
            },
            _sum: {
                quantity: true,
            },
        })

        const notReturnedItems = await prisma.peminjaman.groupBy({
            by: ['barang_id'],
            where: {
                tgl_pinjam: {
                    gte: tanggalMulai
                },
                OR: [
                    {
                        tgl_kembali: {
                            gt: tanggalAkhir
                        }
                    },
                    {
                        tgl_kembali: {
                            equals: new Date(0)
                        }
                    }
                ]
            },
            _count: {
                barang_id: true
            },
            _sum: {
                barang_id: true
            }
        })

        const usageAnalysis = usage_report.map(item => {
            const info = info_tambahan.find(info => info.id === item.barang_id)
            const returnedItem = returnedItems.find(returned => returned.barang_id === item.barang_id)
            const totalReturned = returnedItem?._count?.barang_id ?? 0;
            const itemsInUse = item._count.barang_id - totalReturned;
            return {
                group: info? info[group_by as keyof typeof info]: 'Unknown',
                total_borrowed: item._count.barang_id,
                total_returned: totalReturned,
                items_in_use: itemsInUse
            }
        })

        res.json({
            status: true,
            message: `Laporan peminjaman barang berhasil`,
            data: {
                analysis_period: {
                    tgl_mulai: tanggalMulai.toISOString().split('T')[0],
                    tgl_akhir: tanggalAkhir.toISOString().split('T')[0],
                },
                usage_analysis: usageAnalysis
            },
        }).status(200)
    } catch (error) {
        res.json({
            status: false,
            message: `Ada error dah pokoknya             ${(error as Error).message}`
        }).status(500)
    }
}

export const borrowAnalysis = async (req: Request, res: Response) => {
    const { tgl_mulai, tgl_akhir } = req.body

    if (!tgl_mulai || !tgl_akhir) {
        return res.json({
            status: false,
            message: `Tanggal mulai dan akhir harus diisi ya ges`
        }).status(400)
    }

    const tanggalMulai = new Date(tgl_mulai)
    const tanggalAkhir = new Date(tgl_akhir)

    if (isNaN(tanggalMulai.getTime()) || isNaN(tanggalAkhir.getTime())) {
        return res.json({
            status: false,
            message: `Tanggal harus berupa tanggal yang valid ya ges`
        }).status(400)
    }

    try {
        const freqBarangDipinjam = await prisma.peminjaman.groupBy({
            by: ['barang_id'],
            where: {
                tgl_pinjam: {
                    gte: tanggalMulai
                },
                tgl_kembali: {
                    lte: tanggalAkhir
                }
            },
            _count: {
                barang_id: true
            },
            orderBy: {
                _count: {
                    barang_id: 'desc'
                }
            }
        })

        const detailFreqBarangDipinjam = await Promise.all(freqBarangDipinjam.map(async item => {
            const barang = await prisma.barang.findUnique({
                where: { id: item.barang_id },
                select: { id: true, nama: true, kategori: true }
            })
            return barang ? {
                item_id: item.barang_id,
                nama: barang.nama,
                kategori: barang.kategori,
                total_pinjam: item._count.barang_id
            } : null
        })).then(hasil => 
            hasil.filter(barang => barang != null))

        const inefficientItems = await prisma.peminjaman.groupBy({
            by: ['barang_id'],
            where: {
                tgl_pinjam: {
                    gte: tanggalMulai
                },
                tgl_kembali: {
                    gt : tanggalAkhir
                }
            },
            _count: {
                barang_id: true
            },
            _sum: {
                quantity: true
            },
            orderBy: {
                _count: {
                    barang_id: 'desc'
                }
            }
        })

        const detailInefficientItems = await Promise.all(inefficientItems.map(async item => {
            const barang = await prisma.barang.findUnique({
                where: { id: item.barang_id },
                select: { id: true, nama: true, kategori: true }
            })
            return barang ? {
                item_id: item.barang_id,
                nama: barang.nama,
                kategori: barang.kategori,
                total_pinjam: item._count.barang_id,
                total_terlambat_kembali: item._sum.quantity ?? 0
            } : null
        })).then(hasil => 
            hasil.filter(barang => barang != null))

        res.json({
            status: true,
            data: {
                analysis_period: {
                    tgl_mulai: tanggalMulai,
                    tgl_akhir: tanggalAkhir
                },
                freqBarangDipinjam: detailFreqBarangDipinjam,
                inefficientItems: detailInefficientItems
            },
            message: 'Data barang berhasil diambil'
        })
    }   catch (error) {
        res.json({
            status: false,
            message: `Terjadi kesalahan ${(error as Error).message}`
        })
    }
}