const { MyError, ErrorCode } = require('../errors');

function parseAuthorizationBearer(header) {
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
        log.error(`request to ${request.url} failed`);
        if (err.status) {
            throw new MyError(ErrorCode.ERR_HTTP_NOT200, err);
        } else if (err.timeout) {
            throw new MyError(ErrorCode.ERR_HTTP_TIMEOUT, err);
        } else {
            throw new MyError(ErrorCode.ERR_HTTP, err);
        }
    });
}

module.exports = {
    catchHttpError,
    parseAuthorizationBearer,
};