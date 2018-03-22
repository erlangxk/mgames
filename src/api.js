const Router = require('koa-router');
const router = new Router({ prefix: "/api" });
const parse = require('co-body');
const { insertBets, loadDraw } = require('./db');
const { validateBets } = require('./games');
const request = require('superagent');
const lodash = require('lodash');
const jwt = require('jsonwebtoken');
const util = require('util');

const jwtSignAsync = util.promisify(jwt.sign);
const jwtVerifyAsync = utils.promisify(jwt.verify);

/*
    OPERATOR_NAME+
    GAME_NAME+
    GAME_ID = unique identity as one docker instance
    AUTH_URL
    DATABASE_URL
    REDIS_URL
*/

const result = {
    ok: function (result) {
        return {
            result
        }
    },
    err: function (error, msg) {
        return {
            error,
            msg
        }
    }
}

function parseAuthResponse(res) {
    return res;
}

router.all('/auth/:token', async (ctx, next) => {
    let authUrl = process.env.AUTH_URL;//SHOULD get and verify when server start
    let secret = process.env.JWT_SECRET;
    let operator = process.env.OPERATOR;
    if (lodash.isEmpty(authUrl) || lodash.isEmpty(secret) || lodash.isEmpty(operator)) {
        ctx.throw(500);
    }
    let token = ctx.params.token;
    if (!(lodash.isString(token) && token.length > 0)) {
        ctx.throw(400);
    }
    try {
        const res = await request.post(`${authUrl}/${token}`).retry().timeout(3000);
        const user = parseAuthResponse(res.body);
        const dbUser = loadUser(ctx.dbpool, operator, user.name);
        //look up the user in the database, and save if not exist before, add user id in the result
        const jwtToken = await jwtSignAsync(dbUser, secret, { expiresIn: '24h' });
        ctx.body = jwtToken;
    } catch (err) {
        ctx.throw(504);
    }
    //checkOrSaveUser(user)
    //1. send the request to the auth_url
    //2. parse the response, return error if any, otherwise continue to the next
    //2. save the information in the database(for ban/tracing) if not exist
    //3. jwt sign the information
    //4. return jwtoken back to client
});

router.post('/bet/:draw', async (ctx, next) => {
    // get the token information from header, Authentication: Bear xxxxx
    //varify the token, and get the user info
    //verify the draw
    try {
        const betTime = ctx.state.requestTime;
        const json = await parse.json(ctx);
        const userId = await validateToken(ctx.params.token);
        const draw = await validateDraw(ctx.params.draw, betTime, ctx.dbpool);
        const bets = await validateBets(draw.game, json);
        const betId = await insertBets(ctx.dbpool, userId, draw.drawId, bets.amount, bets.json, betTime);
        ctx.body = `calling /api/bet ${draw}, ${ctx.params.token}, ${JSON.stringify(json)}, ${betId}`;
    } catch (err) {
        ctx.body = `bad request`;
    }
});

async function validateToken(token) {
    let secret = process.env.JWT_SECRET;
    if (lodash.isEmpty(secret)) {
        return result.err(500, 'no jwt secret found');
    }
    try {
        const r = await jwtVerifyAsync(token, secret);
        return result.ok(r);
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return result.err(412, 'token is expired');
        } else {
            return result.err(400, 'malformed token');
        }
    }
}

async function validateDraw(drawId, betTime, dbpool) {
    loadDraw(dbpool, drawId, betTime).then(result => {
        if (result != undefined) {
            return Promise.resolve({ drawId, game: result });
        }
        return Promise.reject(new Error("draw is not found, or bet timing is not right"));
    });
}

module.exports = router;

if (require.main === module) {
    console.log(process.env.AUTH_URL);
}