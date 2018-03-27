const { MyError, ErrorCode } = require('../errors');

function catchHttpError(request) {
    return request.catch(err => {
        const url = request.url;
        if (err.status) {
            const msg = `${url}-${err.status} ${err.message}`;
            throw new MyError(ErrorCode.ERR_HTTP_NOT200, msg);
        } else if (err.timeout) {
            const msg = `${url}-timeout`;
            throw new MyError(ErrorCode.ERR_HTTP_TIMEOUT, msg);
        } else {
            const msg = `${url}-${err.message}`;
            throw new MyError(ErrorCode.ERR_HTTP, msg);
        }
    });
}

module.exports = catchHttpError;