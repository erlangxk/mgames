const lodash = require('lodash');
const db = require('../db');
const { Result, jwtSignAsync } = require('./common');
const { catchHttpError, get } = require('./request');

//TODO
//first the json should have mandatory format
/*
function parseAuthResponse(res) {
    
    if(res.error){
        return 
    }
    const username = res.username;
    const test = res.test;
    const currency = rest.currency;

    if( && !!res.test )
    return res;
}
*/



async function authToken(ctx, next) {
    //SHOULD get and verify when server start
    let log = ctx.state.log;
    let { dbpool, authTokenUrl, jwtSecret, operatorId } = ctx.configs;
    let token = ctx.params.token;
    if (lodash.isString(token) && token.length > 0) {
        const url = `${authTokenUrl}/${token}`;
        try {
            const res = await catchHttpError(log, get(url));
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
