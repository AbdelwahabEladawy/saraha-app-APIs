import { EventEmitter } from "events";
import { sendEmail } from "./sendEmail.js";
import { template } from "./generateHtml.js";
import { customAlphabet } from "nanoid";

export const createOtp = () => {
    const generateOtp = customAlphabet("123456789", 6);
    const otp = generateOtp()
    return otp;
}




export const emailEmitter = new EventEmitter();

emailEmitter.on('confirmEmail', async ({ email, userName, otp }) => {
    console.log("sending email ........");

    const subject = "confirm email"
    const html = template({code: otp, userName, subject })
    await sendEmail({
        to: email,
        subject,
        html
    })
    console.log("email sent successfully");

})


emailEmitter.on('sendPasswordOtp', async ({ email, userName, otp }) => {
    console.log("sending email ........");
    const subject = "forget password"
    const html = template({ code: otp, userName, subject })
    await sendEmail({
        to: email,
        subject,
        html
    })
    console.log("email sent successfully");

})