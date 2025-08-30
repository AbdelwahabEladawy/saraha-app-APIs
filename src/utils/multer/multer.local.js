import multer from "multer"
import fs from "fs"
import path from "path"



export const uploadFile = (folder = "general") => {
    const storage = multer.diskStorage({

        destination: (req, file, cb) => {
            const { user } = req
            const dest = path.resolve(`./src/uploads/${folder}/${user._id}`)
            const finalDest = `./src/uploads/${folder}/${user._id}`
            if (!fs.existsSync(dest)) {
                fs.mkdirSync(dest, { recursive: true })

            }
            req.finalPath = finalDest
            // console.log(dest);

            cb(null, dest)
        },
        filename: (req, file, cb) => {
            console.log({ file });

            cb(null, `${Date.now()}-${file.originalname}`)
        }
    })
    return multer({
        dest: "./dest",
        storage
    })
}



