import joi from "joi"
import { Gender, Roles } from "../DB/models/user.model.js"
import {isValidObjectId} from "mongoose"
const elementsOfValidation = ["body", "query", "params", "headers"]
export const validation = (schema) => {
    return (req, res, next) => {

        const validationErrors = []
        elementsOfValidation.forEach(ele => {

            const result = schema[ele]?.validate(req[ele], { abortEarly: false })
            if (result?.error) {
                validationErrors.push(result.error)
            }
        })
        if (validationErrors.length > 0) {
            return next(new Error(validationErrors, { cause: 400 }))
        } else {
            next()
        }
    }
}




export const generalValidation ={
    name: joi.string().min(3).max(30),
            email: joi.string().email(),
            password: joi.string().min(8).max(20),
            confirmPassword: joi.string().min(8).max(20).valid(joi.ref("password")),
            phone: joi.string().length(11),
            gender: joi.string().valid(Gender.male, Gender.female),
            role: joi.string().valid(Roles.admin, Roles.user),
            age: joi.number().min(18).max(100),
            id:joi.string().custom((value, helpers)=>{
                if(isValidObjectId(value)){
                    return true
                }else{
                    return helpers.message("invalid id")
                }
            })
}