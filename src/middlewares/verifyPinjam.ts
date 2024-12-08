import  { NextFunction, Request, Response } from 'express'
import Joi from 'joi'
import { analisis } from '../controllers/pinjamCtr'

const borrowSchema = Joi.object({
    user_id: Joi.number().required(),
    barang_id: Joi.number().required(),
    tgl_pinjam: Joi.date().iso().required(),
    tgl_kembali: Joi.date().iso().min(Joi.ref('tgl_pinjam')).required(),
    user: Joi.optional()
})

export const verifyBorrow = (request: Request, response: Response, next: NextFunction) => {
    const { error } = borrowSchema.validate(request.body, { abortEarly: false })

    if (error) {
        return response.status(400).json({
            status: false,
            message: error.details.map(it => it.message).join()
        })
    }
    return next()
}

const returnSchema = Joi.object({
    id: Joi.number().required(),
    tgl_kembali: Joi.date().iso().required(),
    status: Joi.string().valid("kembali", "tidak_kembali").required(),
    user: Joi.optional()
})


export const verifyReturn = (request: Request, response: Response, next: NextFunction) => {
    const { error } = returnSchema.validate(request.body, { abortEarly: false })

    if (error) {
        return response.status(400).json({
            status: false,
            message: error.details.map(it => it.message).join()
        })
    }
    return next()
}

const analysisSchema = Joi.object({
    tgl_mulai: Joi.date().iso().required(),
    tgl_akhir: Joi.date().iso().min(Joi.ref("tgl_mulai")),
    group_by: Joi.string().valid("kategori", "lokasi"),
    user: Joi.optional()
})

export const validateAnalysis = (req: Request, res: Response, next: NextFunction) => {
    const { error } = analysisSchema.validate(req.body)
    if (error) {
        return res.json({
            status: false,
            message: error.details.map(it => it.message).join()
        })
    }
    next()
}

const analysisBorrowSchema = Joi.object({
    tgl_mulai: Joi.date().iso().required(),
    tgl_akhir: Joi.date().iso().min(Joi.ref("tgl_mulai")),
    user: Joi.optional()
})

export const validateAnalysisBorrow = (req: Request, res: Response, next: NextFunction) => {
    const { error } = analysisBorrowSchema.validate(req.body)
    if (error) {
        return res.json({
            status: false,
            message: error.details.map(it => it.message).join()
        })
    }
    next()
}