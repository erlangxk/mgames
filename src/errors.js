class MyError extends Error {
    constructor(code, message) {
        super(message);
        this.name = this.constructor.name;
        this.code = code;
    }
    toString(){
        return `code:${this.code},${this.message}`;
    }
}

const ErrorCode = {

    ERR_BET_RESPONSE: 2000,
    ERR_PAYOUT_RESPONSE: 3000,

    ERR_HTTP: 5000,
    ERR_HTTP_TIMEOUT: 5001,
    ERR_HTTP_NOT200: 5002,
};

module.exports = {
    MyError,
    ErrorCode
};