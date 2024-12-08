import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({ errorFormat: "pretty" });

export const getAllBarang = async (req: Request, res: Response) => {
    try {
        const { search } = req.query
        const allBarang = await prisma.barang.findMany({
            where: { nama: { contains: search?.toString() || "" } }
        })

        return res.json({
            status: true,
            message: "Sukses tampilkan barang",
            data: allBarang
        }).status(200)
    } catch (error) {
        return res.json({
            status: false,
            message: `Ada error.${error}`
        }).status(400)
    }
}

export const createBarang = async (req: Request, res: Response) => {
    try {
        const { nama, lokasi, kategori, quantity } = req.body
        const newBarang = await prisma.barang.create({
            data: { nama, lokasi, kategori, quantity }
        })

        return res.json({
            status: true,
            message: "Sukses menambah barang baru",
            data: newBarang
        }).status(200)
    } catch (error) {
        return res.json({
            status: false,
            message: `Ada error.${error}`
        }).status(400)
    }
}

export const updateBarang = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const { nama, lokasi, kategori, quantity } = req.body

        const findBrg = await prisma.barang.findFirst({ where: { id: Number(id) } })
        if (!findBrg) return res.json({
            status: false,
            message: "Gak nemu id barang nih"
        }).status(200)

        const updateBrg = await prisma.barang.update({
            data: {
                nama: nama || findBrg.nama,
                lokasi: lokasi || findBrg.lokasi,
                kategori: kategori || findBrg.kategori,
                quantity: quantity || findBrg.quantity
            },
            where: { id: Number(id) }
        })

        return res.json({
            status: true,
            message: "Sukses update barang",
            data: updateBrg
        }).status(200)
    } catch (error) {
        return res.json({
            status: false,
            message: `Ada error.${error}`
        })
    }
}

export const deleteBarang = async (req: Request, res: Response) => {
    try {
        const { id } = req.params

        const findBrg = await prisma.barang.findFirst({ where: { id: Number(id) } })
        if (!findBrg) return res.json({
            status: false,
            message: "Gak nemu barang nih"
        }).status(200)
        const deleteBrg = await prisma.barang.delete({
            where: { id: Number(id) }
        })

        return res.json({
            status: true,
            message: "Sukses hapus barang",
            data: deleteBrg
        }).status(200)
    } catch (error) {
        return res.json({
            status: false,
            message: `Ada error.${error}`
        }).status(400)
    }
}