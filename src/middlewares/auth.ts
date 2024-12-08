import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";
import { SECRET } from "../global";

interface JwtPayload {
    id: String,
    username: String,
    role: String
}

export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ') [1]

    if (!token) {
        return res.json({
            message: "DITOLAK!! Token gak sesuai"
        }).status(400)
    }

    try {
        const secretKey = SECRET || ""
        const decoded = verify(token, secretKey)
        req.body.user = decoded as JwtPayload
        next()
    }   catch(error) {
        return res.json({
            message: "Salah token"
        }).status(400)
    }
}

export const verifyRole = (allowedRoles: String[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = req.body.user

        if(!user) {
            return res.json({
                message: "DITOLAK!! Informasi gak sesuai"
            }).status(403)
        }

        if(!allowedRoles.includes(user.role)) {
            return res.json({
                message: `DITOLAK!! Kamu gak punya akses. Yang punya akses: ${allowedRoles.join(', ')}`
            }).status(403)
        }

        next()
    }
}