import nodemailer from "nodemailer"
import 'dotenv/config'

export const sendEmail = async ({ to, subject, html }) => {


  const transporter = nodemailer.createTransport({
    host: process.env.host,
    port: process.env.emailPort,
    secure: false,
    auth: {
        user: process.env.user,
        pass: process.env.pass
    },
    tls: {
        rejectUnauthorized: false
    }
});

    const main = async () => {

        const info = await transporter.sendMail({
            from: `sarahaApp <${process.env.user}>`,
            to,
            subject,
            html
        })
    }

    main().catch((err) => {
        console.log(err);

    })


}