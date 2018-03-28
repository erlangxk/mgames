const { MyError, ErrorCode } = require('../errors');

function parseJwtToken(header) {
    if (header) {
        const authHeader = header.authorization;
        if (authHeader) {
            const parts = authHeader.split(' ');
            if (parts.length === 2) {
                const [scheme, credentials] = parts;
                if (/^Bearer$/i.test(scheme)) {
                    return credentials;
                }
            }
        }
    }
    throw new MyError(ErrorCode.ERR_REQUEST_INVALID_TOKEN, 'Bad Authorization header');
};

function catchHttpError(log, request) {
    log.info(`request:${JSON.stringify(request)}`);
    return request.then(result => {
        log.info(`response:${JSON.stringify(result)}`);
        return result;
    }).catch(err => {
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

module.exports = {
    catchHttpError,
    parseJwtToken,
};