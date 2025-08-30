import { create, findById, findOne } from "../../DB/DB.services.js";
import UserModel, { Roles } from "../../DB/models/user.model.js";
import { decodeToken, types } from "../../Middleware/auth.middleware.js";
import { successHandler } from "../../utils/success.res.js";
import jwt from "jsonwebtoken";
import { compare, hash } from "../../utils/bcrypt.js";
import { createOtp, emailEmitter } from "../../utils/sendEmail/emailEvents.js";
import { ExpiredError, NotFoundError } from "../../utils/errors.js";
import { loginSchema } from "./auth.validation.js";
import { nanoid } from "nanoid";
import { revokeTokenModel } from "../../DB/models/revokeToken.js";
import fs from "fs"
import path from "path";



export const signup = async (req, res) => {
  const { name, email, password, age, role, gender, phone } = req.body;
  const isExist = await findOne(UserModel, { email });

  if (isExist) {
    throw new Error("email is already exist", { cause: 400 });
  }

  const otp = createOtp()
  const user = await create(UserModel, {
    name,
    email,
    password,
    age,
    role,
    gender,
    phone,
    emailOtp: {
      otp: hash(otp),
      expiredIn: Date.now() + 60 * 1000
    }
  })

  console.log(otp);

  emailEmitter.emit('confirmEmail', { email: user.email, userName: user.name, otp })
  successHandler({ res, data: user, status: 201 });

}


export const resendOtp = async (req, res, next) => {
  const { email } = req.body;
  let type = "emailOtp"
  let event = "confirmEmail"

  if (req.url.includes("password")) {
    type = "passwordOtp"
    event = "sendPasswordOtp"
  }
  const user = await UserModel.findOne({ email });
  if (!user) {
    return next(new Error("invalid email", { cause: 404 }));
  }

  const otp = createOtp()
  user[type] = {
    otp: hash(otp),
    expiredIn: Date.now() + 60 * 1000
  }
  emailEmitter.emit(event, { email: user.email, name: user.name, otp })
  await user.save()

  return successHandler({ res, status: 202 })



}

export const resendPasswordOtp = async (req, res, next) => {
  const { email } = req.body;
  const user = await UserModel.findOne({ email });
  if (!user) {
    return next(new Error("invalid email", { cause: 404 }));
  }

  const otp = createOtp()
  user.passwordOtp = {
    otp: hash(otp),
    expiredIn: Date.now() + 60 * 1000
  }
  emailEmitter.emit("confirmEmail", { email: user.email, name: user.name, otp })
  await user.save()

  return successHandler({ res, status: 202 })



}


export const login = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await findOne(UserModel, { email });
  if (!user) {
    return next(new Error("invalid email", { cause: 404 }));
  }


  // يجب استخدام user.role وليس user.Roles لأن الحقل في الـ schema اسمه role
  const isMatch = await user.comparePass(password)
  if (!isMatch) {
    return next(new Error("wrong password", { cause: 404 }));
  }

  let accessSignature = ""
  let refreshSignature = ""


  switch (user.role) {
    case Roles.admin:
      accessSignature = process.env.ADMIN_ACCESS_SIGNATURE
      refreshSignature = process.env.ADMIN_REFRESH_SIGNATURE
      break;
    case Roles.user:
      accessSignature = process.env.USER_ACCESS_SIGNATURE || process.env.user_access_signature
      refreshSignature = process.env.USER_REFRESH_SIGNATURE || process.env.user_refresh_signature
      break;


  }

  const jwtid = nanoid()
  const payload = {
    _id: user._id,
    email: user.email,
  }
  const accessToken = jwt.sign(payload, accessSignature, {
    expiresIn: "15m"
    , jwtid
  })

  const refreshToken = jwt.sign(payload, refreshSignature, {
    expiresIn: "7d",
    jwtid
  })




  successHandler({ res, message: "success", data: { accessToken, refreshToken }, status: 202 });

};



export const refreshToken = async (req, res, next) => {

  let accessSignature = ""
  const { authorization } = req.headers


  const { user, decoded } = await decodeToken({ tokenType: types.refresh, authorization, next })


  switch (user.role) {
    case Roles.admin:
      accessSignature = process.env.ADMIN_ACCESS_SIGNATURE
      break;
    case Roles.user:
      accessSignature = process.env.user_access_signature
      break;


  }


  const newAccessToken = jwt.sign({
    _id: user._id,
    email: user.email,
  }, accessSignature, {
    expiresIn: "1 hour",
    jwtid: decoded.jti
  })
  successHandler({ res, data: { newAccessToken }, status: 202 })


}



export const confirmEmail = async (req, res, next) => {
  const { email, otp } = req.body;
  // console.log(email, otp);

  const user = await UserModel.findOne({ email });
  console.log("Received:", email, otp);

  if (!user) {
    return next(new Error("invalid email", { cause: 404 }));
  }

  if (!user.emailOtp) {
    return next(new Error("OTP not found or already confirmed", { cause: 400 }));
  }
  if (user.emailOtp.expiredIn <= Date.now()) {
    return next(new Error("otp is expired", { cause: 400 }))
  }

  const isMatch = compare(otp, user.emailOtp.otp);
  // console.log(user.emailOtp);

  if (!isMatch) {
    return next(new Error("wrong otp", { cause: 404 }));
  }

  await UserModel.updateOne(
    { _id: user._id },
    {
      confirmed: true,
      $unset: { emailOtp: "" }
    }
  );

  successHandler({ res, data: user, status: 202 });
};


export const forgotPassword = async (req, res, next) => {
  const { email } = req.body
  const user = await UserModel.findOne({ email })

  if (!user) {
    return next(new Error("invalid email", { cause: 404 }));
  }
  if (!user.confirmed) {
    return next(new Error("please confirm your email", { cause: 400 }));
  }
  const otp = createOtp()
  user.passwordOtp = {
    otp: hash(otp),
    expiredIn: Date.now() + 60 * 1000
  }
  await user.save()
  console.log(user);



  emailEmitter.emit('sendPasswordOtp', { email: user.email, userName: user.name, otp });
  successHandler({ res, status: 202 });

}





export const changePassword = async (req, res, next) => {

  const { email, otp, newPassword } = req.body
  const user = await UserModel.findOne({ email })

  if (!user) {
    return next(new NotFoundError());

  }
  if (!user.passwordOtp) {
    return next(new Error("invalid otp", { cause: 400 }));
  }
  if (user.passwordOtp.expiredIn <= Date.now()) {
    return next(new ExpiredError())
  }





  if (compare(otp, user.passwordOtp.otp)) {

    await UserModel.updateOne(
      { _id: user._id },
      {
        password: newPassword,
        credentialChangedAt: Date.now(),
        $unset: { passwordOtp: "" }
      }
    );
    successHandler({ res, data: user, status: 202 });
  }








}






export const changeEmail = async (req, res, next) => {
  const { newEmail } = req.body
  const { user } = req
  console.log(user);


  if (newEmail === user.email) {
    return next(new Error("new email is same as old email", { cause: 400 }));
  }

  const isExist = await UserModel.findOne({ email: newEmail })
  if (isExist) {
    return next(new Error("email is already exist", { cause: 400 }));
  }

  // old email 
  const oldEmailOtp = createOtp()
  user.emailOtp.otp = hash(oldEmailOtp)
  user.emailOtp.expiredIn = Date.now() + 60 * 1000

  emailEmitter.emit("confirmEmail", { email: user.email, userName: user.name, otp: oldEmailOtp })

  // new email 

  const newEmailOtp = createOtp()
  user.newEmailOtp.otp = hash(newEmailOtp)
  user.newEmailOtp.expiredIn = Date.now() + 60 * 1000

  emailEmitter.emit("confirmEmail", { email: newEmail, userName: user.name, otp: newEmailOtp })



  // make confirm = false


  user.confirmed = false
  user.newEmail = newEmail

  await user.save()

  successHandler({ res, status: 201 });



























}





export const confirmUpdateEmail = async (req, res, next) => {
  const { email, newEmailOtp, oldEmailOtp } = req.body
  const user = await UserModel.findOne({ email })

  if (!user) {
    return next(new Error("invalid email", { cause: 404 }));
  }

  if (!user.emailOtp || !user.newEmailOtp) {
    return next(new Error("invalid otp", { cause: 400 }));
  }
  if (user.emailOtp.expiredIn <= Date.now() || user.newEmailOtp.expiredIn <= Date.now()) {
    return next(new Error("otp is expired", { cause: 400 }))
  }

  if (!compare(oldEmailOtp, user.emailOtp.otp) || !compare(newEmailOtp, user.newEmailOtp.otp)) {
    return next(new Error("invalid otp", { cause: 400 }));
  }
  user.email = user.newEmail
  user.newEmail = undefined
  user.newEmailOtp = undefined
  user.emailOtp = undefined
  user.confirmed = true
  await user.save()
  successHandler({ res, data: user, status: 202 });
}



export const resendUpdateEmailOtp = async (req, res, next) => {
  const { email } = req.body;
  const user = await UserModel.findOne({ email });
  if (!user) {
    return next(new Error("invalid email", { cause: 404 }));
  }

  const oldEmailOtp = createOtp()
  user.emailOtp.otp = hash(oldEmailOtp)
  user.emailOtp.expiredIn = Date.now() + 60 * 1000

  emailEmitter.emit("confirmEmail", { email: user.email, userName: user.name, otp: oldEmailOtp })

  // new email 

  const newEmailOtp = createOtp()
  user.newEmailOtp.otp = hash(newEmailOtp)
  user.newEmailOtp.expiredIn = Date.now() + 60 * 1000


  await user.save()
  emailEmitter.emit("confirmEmail", { email: user.newEmail, userName: user.name, otp: newEmailOtp })

  return successHandler({ res, status: 202 })



}




export const softDelete = async (req, res, next) => {
  const { id } = req.params
  let loggedInUser = req.user
  let user = await UserModel.findById(id)


  if (!user) {
    return next(new NotFoundError())
  }

  if (loggedInUser._id.toString() != user._id.toString() && loggedInUser.role != Roles.admin) {
    return next(new Error("you have the access to delete ", { cause: 401 }))
  }

  user.isActive = false
  user.deletedBy = loggedInUser._id
  await user.save()
  successHandler({ res })


}

export const hardDelete = async (req, res, next) => {
  const { id } = req.params
  const user = await UserModel.findById(id)
  if (user.role == Roles.admin) {
    return next(new Error("admin account can not be deleted", { cause: 401 }))
  }
const path = user.profileImage
console.log(path);




  // await user.deleteOne()
  successHandler({ res })

}

export const restoreAccount = async (req, res, next) => {
  const { id } = req.params
  const loggedInUser = req.user
  const user = await UserModel.findById(id)

  if (!user) {
    return next(new NotFoundError())
  }
  if (user.isActive) {
    return next(new Error("this account is not deleted ", { cause: 409 }))
  }

  if (!(loggedInUser.role == Roles.admin || (user._id.toString() == loggedInUser._id && user.deletedBy.toString() == loggedInUser._id.toString()))) {
    return next(new Error("you have not the access to restore ", { cause: 401 }))
  }
  user.isActive = true
  user.deletedBy = undefined
  await user.save()
  successHandler({ res })








}


export const updatePassword = async (req, res, next) => {
  const { user } = req
  const { newPassword, oldPassword } = req.body
  console.log(newPassword);

  if (compare(newPassword, user.password)) {
    return next(new Error("new password can not be same as old password", { cause: 400 }))
  }
  for (const password of user.oldPasswords) {
    if (compare(newPassword, password)) {

      console.log("from for:", newPassword);
      console.log(password);
      return next(new Error("new password can not be same as old password", { cause: 400 }))
    }
  }
  user.oldPasswords.push(user.password)
  user.password = newPassword
  user.credentialChangedAt = Date.now()
  await user.save()
  successHandler({ res, data: user, status: 202 })
}




export const logout = async (req, res, next) => {
  const { user } = req
  const tokenData = req.decoded
  // console.log({tokenData});
  await revokeTokenModel.create({
    userId: user._id,
    jti: tokenData.jti,
    expiresIn: tokenData.iat + 7 * 24 * 60 * 60
  })

  successHandler({ res })

}

export const logoutFromAllDevices = async (req, res, next) => {
  const { user } = req
  user.credentialChangedAt = Date.now()
  await user.save()
  successHandler({ res })

}
