const { MyError, ErrorCode } = require('../errors');
const got = require('got');

const DEFAULT_OPTS = {
    timeout: 3000,
    retries: 3,
    headers: {
        'user-agent': 'unkown',
    },
    json: true,
};

function get(url) {
    return got.get(url, DEFAULT_OPTS);
}

function post(url, data) {
    const opts = Object.assign({
        body: data,
        form: true
    }, DEFAULT_OPTS);
    return got.post(url, opts);
}

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
        if (err.name === 'HTTPError') {
            throw new MyError(ErrorCode.ERR_HTTP_NOT200, err);
        } else if (err.name === 'ParseError') {
            throw new MyError(ErrorCode.ERR_HTTP_INVALID_JSON, err);
        } else if (err.name === 'RequestError' && err.code === 'ETIMEDOUT') {
            throw new MyError(ErrorCode.ERR_HTTP_TIMEOUT, err);
        } else {
            throw new MyError(ErrorCode.ERR_HTTP, err);
        }
    });
}

module.exports = {
    catchHttpError,
    parseAuthorizationBearer,
    get,
    post,
};