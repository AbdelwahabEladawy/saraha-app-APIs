export class NotFoundError extends Error {
    constructor() {
        super("NOT FOUND ", { cause: 404 })
    }
}


export class ExpiredError extends Error {
    constructor() {
        super("otp Expired", { cause: 400 })
    }
}



