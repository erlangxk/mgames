class MyError extends Error {
    constructor(code, message) {
        super(message);
        this.name = this.constructor.name;
        this.code = code;
    }
    toString() {
        return `code:${this.code},${this.message}`;
    }
}

const ErrorCode = {
    ERR_REQUEST_INVALID_TOKEN: 1000,
    ERR_REQUEST_INVALID_DRAW: 1001,


    ERR_WALLET_BET_RESPONSE: 2000,
    ERR_WALLET_PAYOUT_RESPONSE: 3000,
    ERR_AUTH_TOKEN_RESPONSE: 4000,

    ERR_HTTP: 5000,
    ERR_HTTP_TIMEOUT: 5001,
    ERR_HTTP_NOT200: 5002,
};

module.exports = {
    MyError,
    ErrorCode
};