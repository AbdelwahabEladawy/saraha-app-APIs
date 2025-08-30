import joi from "joi";
import { Gender, Roles } from "../../DB/models/user.model.js";
import { generalValidation } from "../../Middleware/validation.middleware.js";



export const loginSchema = {
    body: joi.object({
        email: generalValidation.email.required(),
        password: generalValidation.password.required(),

    })
}


export const confirmEmailSchema = {
    body: joi.object({
        email: generalValidation.email.required(),
        otp: joi.string().length(6).required(),

    }),
    params: joi.object({
        id: joi.number().required(),

    })
}

export const signupSchema = {
    body: joi.object({

        name: generalValidation.name.required(),
        email: generalValidation.email.required(),
        password: generalValidation.password.required(),
        confirmPassword: generalValidation.confirmPassword.required(),
        phone: generalValidation.phone.required(),
        gender: generalValidation.gender,
        role: generalValidation.role,
        age: generalValidation.age,






    }).required()
}