const lodash = require('lodash');
const { Result } = require('./common');
const { selectUserOrInsert } = require('./db');

function parseAuthResponse(res) {
    return res;
}

async function authToken(ctx, next) {
    //SHOULD get and verify when server start
    let { authUrl, jwtSecret, operatorId } = ctx.configs;
    let token = ctx.params.token;
    if (lodash.isString(token) && token.length > 0) {
        try {
            const res = await request.post(`${authUrl}/${token}`).retry().timeout(3000);
            const user = parseAuthResponse(res.body);
            const userId = await selectUserOrInsert(ctx.dbpool, operatorId, user.name);
            const jwtToken = await jwtSignAsync({ id: userId, ...user }, secret, { expiresIn: '24h' });
            ctx.body = Result.ok(jwtToken);
        } catch (err) {
            console.error("authToken failed", err);
            ctx.throw(504);
        }
    } else {
        ctx.throw(400);
    }
}
