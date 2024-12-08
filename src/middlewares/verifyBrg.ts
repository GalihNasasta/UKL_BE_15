import  { NextFunction, Request, Response } from 'express'
import Joi from 'joi'

const addDataSchema = Joi.object({
    nama: Joi.string().required(),
    lokasi: Joi.string().required(),
    kategori: Joi.string().required(),
    quantity: Joi.number().min(0).required(),
    user: Joi.optional()
})

const editDataSchema = Joi.object({
    nama: Joi.string().optional(),
    lokasi: Joi.string().optional(),
    kategori: Joi.string().optional(),
    quantity: Joi.number().min(0).optional(),
    user: Joi.optional()
})

export const verifyAddBarang = (request: Request, response: Response, next: NextFunction) => {
    const { error } = addDataSchema.validate(request.body, { abortEarly: false })

    if (error) {
        return response.status(400).json({
            status: false,
            message: error.details.map(it => it.message).join()
        })
    }
    return next()
}

export const verifyEditBarang = (request: Request, response: Response, next: NextFunction) => {
    const { error } = editDataSchema.validate(request.body, { abortEarly: false })

    if (error) {
        return response.status(400).json({
            status: false,
            message: error.details.map(it => it.message).join()
        })
    }
    return next()
}