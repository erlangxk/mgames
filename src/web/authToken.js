const lodash = require('lodash');
const request = require('superagent');
const db = require('../db');

const { Result, jwtSignAsync } = require('./common');
const catchHttpError = require('./request');

function parseAuthResponse(res) {
    return res;
}

async function authToken(ctx, next) {
    //SHOULD get and verify when server start
    let log = ctx.state.log;
    let { dbpool, authTokenUrl, jwtSecret, operatorId } = ctx.configs;
    let token = ctx.params.token;
    if (lodash.isString(token) && token.length > 0) {
        try {
            const res = await catchHttpError(log, request.post(`${authTokenUrl}/${token}`).retry().timeout(3000));
            const user = parseAuthResponse(res.body);
            const userId = await db.selectUserOrInsert(dbpool, operatorId, user.username);
            const jwtToken = await jwtSignAsync({ id: userId, ...user }, jwtSecret, { expiresIn: '24h' });
            ctx.body = Result.ok(jwtToken);
        } catch (err) {
            log.error({ err, req: ctx.req }, "authToken failed");
            ctx.throw(504);
        }
    } else {
        ctx.throw(400);
    }
}

module.exports = authToken;
