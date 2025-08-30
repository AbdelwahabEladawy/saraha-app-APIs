import { Schema, model, Types } from "mongoose";

export const revokeTokenSchema = new Schema({
    jti: {
        type: String,
        required: true,
        unique: true,
    },
    user: {
        type: Types.ObjectId,
        ref: "users",
        // required: true,
    },
    expiresIn: {
        type: Date,
        required: true
    }
}, {
    timestamps: true
})




export const revokeTokenModel = model("revokeTokens", revokeTokenSchema) 