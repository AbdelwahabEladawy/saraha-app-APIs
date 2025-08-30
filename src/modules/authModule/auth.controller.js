import { Router } from "express";
import {logoutFromAllDevices, changeEmail, changePassword, confirmEmail, confirmUpdateEmail, forgotPassword, login, logout, refreshToken, resendOtp, resendUpdateEmailOtp, signup, updatePassword } from "./auth.service.js";
import { confirmEmailSchema, loginSchema, signupSchema } from "./auth.validation.js";
import { validation } from "../../Middleware/validation.middleware.js";
import { auth } from "../../Middleware/auth.middleware.js";

const router = Router();

router.post("/signUp", validation(signupSchema), signup);
router.post("/login", validation(loginSchema), login);
router.post("/refresh-token", refreshToken);
router.post("/confirm-email", validation(confirmEmailSchema), confirmEmail);
router.post("/resend-email-otp", resendOtp);
router.post("/resend-password-otp", resendOtp);
router.patch("/forget-password", forgotPassword);
router.patch("/change-password", changePassword);
router.patch("/update-email", auth(), changeEmail);
router.patch("/confirm-update-email", confirmUpdateEmail);
router.patch("/resend-confirm-update-email", resendUpdateEmailOtp);
router.patch("/update-password", auth(), updatePassword)
router.patch("/logout", auth(), logout)
router.patch("/logout-from-all-devices", auth(), logoutFromAllDevices)


export default router;
