
const lodash = require('lodash');

class MyError extends Error {
    constructor(code, cause) {
        if (lodash.isError(cause)) {
            super(cause.message);
        } else {
            super(lodash.toString(cause));
        }
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

    ERR_DB: 6000,
};

module.exports = {
    MyError,
    ErrorCode
};