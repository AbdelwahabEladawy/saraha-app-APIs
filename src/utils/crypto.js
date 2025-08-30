
import crypto from "crypto-js";




export const encryption = (text) => {


  return crypto.AES.encrypt(text, process.env.ENCRYPTED_PHONE_KEY).toString();

}


export const decryption = (text) => {
    return crypto.AES.decrypt(text, process.env.ENCRYPTED_PHONE_KEY).toString(crypto.enc.Utf8);



}