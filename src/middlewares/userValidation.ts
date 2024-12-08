import  { NextFunction, Request, Response } from 'express'
import Joi from 'joi'

const authSchema = Joi.object({
    username: Joi.string().required(),
    password:  Joi.string().min(3).alphanum().required()
})

const addDataSchema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().min(3).alphanum().required(),
    role: Joi.string().valid("ADMIN", "CUSTOMER").required(),
    user: Joi.optional()
})

const editDataSchema = Joi.object({ 
    username: Joi.string().optional(),
    password: Joi.string().min(3).alphanum().optional(),
    role: Joi.string().valid("ADMIN", "CUSTOMER").optional(),
    user:Joi.optional()
    
})

export const verifyAuthentication = (req: Request, res: Response, next: NextFunction) => {
    const { error } = authSchema.validate(req.body, { abortEarly: false })

    if (error) {
        return res.status(400).json({
            status: false,
            message: error.details.map((it) => it.message).join()
        })
    }
    return next()
}

export const verifyAddData = (req: Request, res: Response, next: NextFunction) => {
    const { error } = addDataSchema.validate(req.body, { abortEarly: false })

    if (error) {
        return res.status(400).json({
            status: false,
            message: error.details.map((it) => it.message).join()
        })
    }
    return next()
}

export const verifyEditUser = (request: Request,  response: Response, next: NextFunction) => {
    const { error } = editDataSchema.validate(request.body, { abortEarly: false })

    if  (error) {
        return response.status(400).json({
            status: false,
            message: error.details.map((it) => it.message).join()
        })
    }
    return next()
}
