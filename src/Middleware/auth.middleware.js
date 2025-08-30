import jwt from "jsonwebtoken";
import { findById } from "../DB/DB.services.js";
import UserModel, { Roles } from "../DB/models/user.model.js";
import { revokeTokenModel } from "../DB/models/revokeToken.js";

export const types = {
    access: "access",
    refresh: "refresh"
}
Object.freeze(types);

export const decodeToken = async ({ tokenType = types.access, authorization, next }) => {
    if (!authorization) {
        return next(new Error("please send token", { cause: 400 }));
    }

    const [bearerRaw, token] = authorization.split(" ");
    if (!bearerRaw || !token) {
        return next(new Error("invalid token format", { cause: 400 }));
    }

    const bearer = String(bearerRaw).trim();
    const bearerLc = bearer.toLowerCase();

    // جهّز مفاتيح البيئة مع دعم fallback للأسماء المختلفة في الملفات
    const ADMIN_ACCESS = process.env.ADMIN_ACCESS_SIGNATURE;
    const ADMIN_REFRESH = process.env.ADMIN_REFRESH_SIGNATURE;
    const USER_ACCESS = process.env.USER_ACCESS_SIGNATURE || process.env.user_access_signature;
    const USER_REFRESH = process.env.USER_REFRESH_SIGNATURE || process.env.user_refresh_signature;

    let accessSignature = "";
    let refreshSignature = "";

    console.log("🛠 Bearer Type:", bearer);
    // لا تطبع التوكن نفسه في الإنتاج

    // Authorization: Bearer <token>
    if (bearerLc === "bearer") {
        const signatures = [
            { access: ADMIN_ACCESS, refresh: ADMIN_REFRESH },
            { access: USER_ACCESS, refresh: USER_REFRESH }
        ];

        let user = null;
        for (const sig of signatures) {
            try {
                const signature = tokenType === types.access ? sig.access : sig.refresh;
                if (!signature) continue;
                const payload = jwt.verify(token, signature);
                user = await findById(UserModel, payload._id);
                if (user) break;
            } catch (error) {
                continue;
            }
        }

        if (!user) {
            return next(new Error("invalid token", { cause: 401 }));
        }

        if (user.confirmed === false) {
            return next(new Error("please confirm your email", { cause: 401 }));
        }


        return user;

        // Authorization: admin <token> | user <token>
    } else if (bearerLc === Roles.admin || bearerLc === Roles.user) {
        switch (bearerLc) {
            case Roles.admin:
                accessSignature = ADMIN_ACCESS;
                refreshSignature = ADMIN_REFRESH;
                break;
            case Roles.user:
                accessSignature = USER_ACCESS;
                refreshSignature = USER_REFRESH;
                break;
        }

        const signature = tokenType === types.access ? accessSignature : refreshSignature;
        if (!signature) {
            return next(new Error("server misconfiguration: missing JWT signature", { cause: 500 }));
        }

        try {
            const payload = jwt.verify(token, signature);
            const user = await findById(UserModel, payload._id);
            console.log(payload);

            if (!user) {
                return next(new Error("user not found", { cause: 404 }));
            }

            if (await revokeTokenModel.findOne({ jti: payload.jti })) {
                next(new Error("token is revoked", { cause: 401 }));
            }


            if (user.credentialChangedAt?.getTime() >= payload.iat * 1000) {
                return next(new Error("user please login again", { cause: 400 }));
            }

            return { user, decoded: payload }
        } catch (error) {
            return next(new Error("invalid token", { cause: 401 }));
        }

    } else {
        return next(new Error("invalid token format", { cause: 400 }));
    }



};



export const auth = (activation = true) => {
    return async (req, res, next) => {
        const { authorization } = req.headers;
        const { user, decoded } = await decodeToken({ authorization, next });
        req.user = user;
        req.decoded = decoded;
        if (!activation) {
            return next(new Error("user not found", { cause: 404 }));
        }
        next();
    };
};

export const allowTo = (...Roles) => {
    return async (req, res, next) => {
        const { user } = req;
        // console.log("👤 Authenticated User:", user);

        if (!Roles.includes(user.role)) {
            return next(new Error("you are not authorized to access this end point ", { cause: 403 }));
        }
        next();
    };
};
