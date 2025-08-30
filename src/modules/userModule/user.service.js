import jwt from "jsonwebtoken"
import { findById } from "../../DB/DB.services.js"
import UserModel from "../../DB/models/user.model.js"
import { successHandler } from "../../utils/success.res.js"
import { decryption } from "../../utils/crypto.js";
import { cloudConfig } from "../../utils/multer/cloudinary.js";



export const getUserProfile = async (req, res, next) => {
    const { user } = req

    // بناء اللينك
    const protocol = req.protocol; // http
    const host = req.get("host"); // localhost:3000

    // نعدل مسار الصورة قبل ما نرجع الـ response
    let userResponse = {
        ...user._doc, // عشان نجيب الـ document كـ object عادي
    }

    if (userResponse.profileImage) {
        // نشيل الـ ./src من بداية المسار
        const cleanPath = userResponse.profileImage.replace("./src", "");
        userResponse.profileImage = `${protocol}://${host}${cleanPath}`;
    }

    successHandler({ res, data: userResponse, status: 200 })
}

export const updateUserInfo = async (req, res, next) => {
    const { name, phone } = req.body
    const { user } = req

    await UserModel.updateOne(
        { _id: user._id },
        {
            name,
            phone
        }
    );
    successHandler({ res, data: user, status: 202 });



}



export const uploadImage = async (req, res, next) => {
    const { user } = req
    const { file, finalPath } = req
    console.log({ file });

    if (user.profileImage?.public_id) {
        cloudConfig().uploader.destroy(user.profileImage.public_id)
    }

    const { secure_url, public_id } = await cloudConfig().uploader.upload(file.path, {
        folder: `${process.env.APP_NAME}/users/${user.name}_${user._id}/profile`
    })
    user.profileImage = {
        secure_url,
        public_id
    }




    await user.save()
    successHandler({ res, data: user })

}
