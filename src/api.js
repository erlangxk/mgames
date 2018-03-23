"use strict";

const Router = require('koa-router');
const router = new Router({ prefix: "/api" });
const parse = require('co-body');
const { insertBets, loadDraw, selectUserOrInsert, insertWalletBet, updateWalletBet } = require('./db');
const { validateBets } = require('./games');
const request = require('superagent');
const lodash = require('lodash');
const jwt = require('jsonwebtoken');
const util = require('util');
const BaseError = require('./exp');

const jwtSignAsync = util.promisify(jwt.sign);
const jwtVerifyAsync = utils.promisify(jwt.verify);

class InitializationError extends BaseError { };
class BetResponseParseError extends BaseError { };
class WalletBetRequestError extends BaseError { };
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
        const userId = selectUserOrInsert(ctx.dbpool, operator, user.name);
        const jwtToken = await jwtSignAsync({ id: userId, ...user }, secret, { expiresIn: '24h' });
        ctx.body = result.ok(jwtToken);
    } catch (err) {
        ctx.throw(504);
    }
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
        //insert wallet request into database.
        //send request to deduct money
        //update wallet request

        ctx.body = `calling /api/bet ${draw}, ${ctx.params.token}, ${JSON.stringify(json)}, ${betId}`;
    } catch (err) {
        return ctx.throw(400);
    }
});

function parseWalletBetResponse(res) {
    throw new BetResponseParseError("not well formatted");
}

async function sendRequestToWallet(dbpool, walletUrl, drawId, betId, amount) {
    try {
        const gameTrxId = insertWalletBet(dbpool, betId, amount);
        const res = request.post(walletUrl).query({ trxId: gameTrxId, amount, drawId, betId }).retry().timeout(3000);
        const result = parseWalletBetResponse(res);
        await updateWalletBet(dbpool, result.walletTrxId, result.walletCode, 0, result.trxId);
        return (!!result.ok);
    } catch (err) {
        console.error("failed to send request to wallet", err);
        let error;
        if (err.timeout) {
            error = 1;
        } else if (err instanceof BetResponseParseError) {
            error = 2;
        } else {
            error = 3;
        }
        await updateWalletBet(dbpool, undefined, undefined, error, gameTrxId);
        throw new WalletBetRequestError("failed to send request to wallet");
    }
}

async function validateToken(token) {
    let secret = process.env.JWT_SECRET;
    if (lodash.isEmpty(secret)) {
        return Promise.reject(new InitializationError('no jwt secret found'));
    }
    return jwtVerifyAsync(token, secret);
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