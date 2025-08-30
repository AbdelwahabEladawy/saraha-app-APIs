
import joi from "joi";
import { generalValidation } from "../../Middleware/validation.middleware.js";
export const getUserProfileSchema = {
    params: joi.object({
        id: generalValidation.id.required(),
    }),
};