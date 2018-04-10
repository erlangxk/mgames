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
    const opts = DEFAULT_OPTS;
    return {
        run: () => got.get(url, opts),
        url,
        opts,
    }
}

function post(url, data) {
    const opts = Object.assign({
        body: data,
        form: true
    }, DEFAULT_OPTS);
    return {
        run: () => got.post(url, opts),
        url,
        opts,
    }
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
    log.info(`request sent, url: ${request.url}, opts:${JSON.stringify(request.opts)}`);
    return request.run().then(result => {
        log.info(`response got, url: ${request.url}, body:${JSON.stringify(result.body)}`);
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