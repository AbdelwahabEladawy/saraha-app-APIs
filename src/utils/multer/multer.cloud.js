import multer from "multer"




export const cloudUploadFile = (folder = "general") => {
    const storage = multer.diskStorage({})
    return multer({
        dest: "./dest",
        storage
    })
}