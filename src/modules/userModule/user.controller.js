import { Router } from "express";
import { getUserProfile, updateUserInfo, uploadImage } from "./user.service.js";
import { allowTo, auth } from "../../Middleware/auth.middleware.js";
import { Roles } from "../../DB/models/user.model.js";
import { hardDelete, restoreAccount, softDelete, updatePassword } from "../authModule/auth.service.js";
import { uploadFile } from "../../utils/multer/multer.local.js";
import { cloudUploadFile } from "../../utils/multer/multer.cloud.js";

const router = Router();

router.get("/", auth(), allowTo(Roles.admin, Roles.user), getUserProfile)
router.post("/update-info/:id", auth(), updateUserInfo)
router.patch("/soft-delete/:id", auth(), softDelete)
router.patch("/restore-account/:id", auth(false), restoreAccount)
router.delete("/hard-delete/:id", auth(), allowTo(Roles.admin), hardDelete)




router.patch("/profile-image", auth(), cloudUploadFile().single("image"), uploadImage)
// router.patch("/cover-image", auth(), cloudUploadFile(), ("cover").array("image", 5), uploadImage)






export default router;