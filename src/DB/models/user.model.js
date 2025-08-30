import { Schema, get, model, set, Types } from "mongoose";
import { decryption, encryption } from "../../utils/crypto.js";
import { compare, hash } from "../../utils/bcrypt.js";

export const Roles = {
  admin: "admin",
  user: "user",
};
Object.freeze(Roles);
export const Gender = {
  male: "male",
  female: "female",
};
export const profileImageSchema = new Schema({
  public_id: String,
  secure_url: String
}, { _id: false })

Object.freeze(Gender);
const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      max: 30,
      min: 3,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },

    ///////////

    newEmail: String,
    profileImage: String
    ////////////
    ,
    password: {
      type: String,
      required: true,
      min: 4,
      max: 20,
      set(value) {
        return hash(value)
      }
    },
    age: Number,
    role: {
      type: String,
      enum: Object.values(Roles),
      default: Roles.admin,
    },
    gender: {
      type: String,
      enum: Object.values(Gender),
      default: Gender.male,
    },
    phone: {
      type: String,
      required: true,
      set(value) {
        return encryption(value);
      },
      get(value) {
        return decryption(value);
      },

    },
    confirmed: {
      type: Boolean,
      default: false
    },
    emailOtp: {
      otp: String,
      expiredIn: Date
    },
    newEmailOtp: {
      otp: String,
      expiredIn: Date
    },
    passwordOtp: {
      otp: String,
      expiredIn: Date
    },
    credentialChangedAt: {
      type: Date,

    },
    isActive: {
      type: Boolean
      , default: true
    },
    deletedBy: {
      type: Types.ObjectId
      , ref: "user"
    },
    oldPasswords: [
      {
        type: String
      },

    ]

  },



  {
    timestamps: true,
    toJSON: {
      getters: true,
      virtuals: true,
    },
    toObject: {
      getters: true,

    },
    virtuals: {
      userData: {
        get() {
          return `Hello ${this.name}, your email is ${this.email}, your age is ${this.age} ,phone is ${this.phone}`;
        }
      }
    },
    methods: {
      comparePass(pass) {
        return compare(pass, this.password)
      }
    }
  }
);

const UserModel = model("users", userSchema);


export default UserModel;

