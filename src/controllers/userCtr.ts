import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import md5 from "md5"
import { SECRET } from "../global";
import { sign } from "jsonwebtoken";

const prisma = new PrismaClient({ errorFormat: "pretty" });

export const getAllUser = async (req: Request, res: Response) => {
    try {
        const { search } = req.query
        const allUser = await prisma.user.findMany({
            where: { username: { contains: search?.toString() || "" } }
        })

        return res.json({
            status: true,
            message: "Sukses tampilkan user",
            data: allUser
        }).status(200)
    } catch (error) {
        return res.json({
            status: false,
            message: `Ada error.${error}`
        }).status(400)
    }
}

export const createUser = async (req: Request, res: Response) => {
    try {
        const { username, password, role } = req.body
        const newUser = await prisma.user.create({
            data: { username, password: md5(password), role }
        })

        return res.json({
            status: true,
            message: "Sukses membuat user baru",
            data: newUser
        }).status(200)
    } catch (error) {
        return res.json({
            status: false,
            message: `USERNAME SUDAH DIGUNAKAN.`
        }).status(400)
    }
}

export const register = async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body
        const role = "CUSTOMER"

        const newCust = await prisma.user.create({
            data: { username, password, role }
        })

        return res.json({
            status: true,
            message: "Sukses membuat user baru",
            data: newCust
        }).status(200)
    } catch (error) {
        return res.json({
            status: false,
            message: `Ada error.${error}`
        }).status(400)
    }
}

export const login = async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body
        const findUser = await prisma.user.findFirst({
            where: { username, password: md5(password) }
        })
        if(!findUser) return res.status(200).json({
            status: false,
            logged: false,
            message: "Username atau password salah"
            })

        let data = {
            id: findUser.id,
            username: findUser.username,
            role: findUser.role
        }

        let payload = JSON.stringify(data)
        let token = sign(payload, SECRET || "token")

        return res.json({
            status: true,
            logged: true,
            message: "Sukses login",
            token
        }).status(200)
    } catch (error) {
        return res.json({
            status: false,
            message: `Ada error.${error}`
        }).status(400)
    }
}

export const updateCust = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const { username, password } = req.body
        const role = "CUSTOMER"

        const findCust = await prisma.user.findFirst({ where: { id: Number(id) } })
        if (!findCust) return res.json({
            status: false,
            message: "Gak nemu user nih"
        }).status(200)

        const updateCust = await prisma.user.update({
            data: {
                username: username || findCust.username,
                password: md5(password) || findCust.password,
                role
            },
            where: { id: Number(id) }
        })

        return res.json({
            status: true,
            message: "Sukses update user",
            data: updateCust
        }).status(200)
    } catch (error) {
        return res.json({
            status: false,
            message: `Ada error.${error}`
        })
    }
}

export const updateUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const { username, password, role } = req.body

        const findUser = await prisma.user.findFirst({ where: { id: Number(id) } })
        if (!findUser) return res.json({
            status: false,
            message: "User id tidak ditemukan"
        }).status(200)

        const updateUser = await prisma.user.update({
            data: {
                username: username || findUser.username,
                password: md5(password) || findUser.password,
                role: role || findUser.role
            },
            where: { id: Number(id)}
        })

        return res.json({
            status: true,
            message: "Sukses update user",
            data: updateUser
        }).status(200)
    }   catch(error) {
        return res.json({
            status: false,
            message: `Ada error.${error}`
        })
    }
}

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params

        const findUser = await prisma.user.findFirst({ where: { id: Number(id) } })
        if (!findUser) return res.json({
            status: false,
            message: "Gak nemu user nih"
        }).status(200)
        const deleteUser = await prisma.user.delete({
            where: { id: Number(id) }
        })

        return res.json({
            status: true,
            message: "Sukses hapus user",
            data: deleteUser
        }).status(200)
    } catch (error) {
        return res.json({
            status: false,
            message: `Ada error.${error}`
        }).status(400)
    }
}