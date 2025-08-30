import { required } from "joi";
import { Schema, model, Types } from "mongoose";

const messageSchema = new Schema({

    body: {
        type: String,
        required: function () {
            if (images.length > 0) {
                return false

            } else {
                return true

            }
        },

        images: [profileImageSchema],


        from: {
            type: Types.ObjectId,
            ref: "users"
        },
        to: {
            type: Types.ObjectId,
            ref: "users",
            required: true,
        }

    }











})



export default messageModel = model("messages", messageSchema) 