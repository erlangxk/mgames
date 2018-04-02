const db = require('../db');
const bodyParser = require('co-body');
const lodash = require('lodash');
const request = require('superagent');
const games = require('./games');

const { parseAuthorizationBearer, catchHttpError } = require('./request');
const { MyError, ErrorCode } = require('../errors');
const { Result, jwtVerifyAsync } = require('./common');

async function userBet(ctx, next) {
    const dbpool = ctx.configs.dbpool;
    try {
        const userId = await validateToken(ctx);
        const draw = await validateDraw(ctx);
        const json = await bodyParser.json(ctx);
        const bets = await games.validateBets(draw.game, json);
        //above all, should be 400
        const betTime = ctx.state.requestTime;
        const betId = await db.insertBets(dbpool, userId, draw.drawId, bets.total, bets.amount, bets.json, betTime);
        //insert wallet request into database.
        //send request to deduct money
        //update wallet request

        ctx.body = Result.ok(`calling /api/bet ${draw}, ${ctx.params.token}, ${JSON.stringify(json)}, ${betId}`);
    } catch (err) {
        ctx.state.log.info(err);
        return ctx.throw(400);
    }
}

async function validateToken(ctx) {
    const jwtSecret = ctx.configs.jwtSecret;
    const token = parseAuthorizationBearer(ctx.header);
    const result = await jwtVerifyAsync(token, jwtSecret);
    const userId = result.id;
    ctx.state.log = ctx.state.log.child({ userId });
    return userId;
}

async function validateDraw(ctx) {
    const drawId = ctx.params.draw;
    const dbpool = ctx.configs.dbpool;
    const betTime = ctx.state.requestTime;
    const result = await db.loadDraw(dbpool, drawId, betTime);
    if (result !== undefined) {
        return ({ drawId, game: result });
    }
    throw new MyError(ErrorCode.ERR_REQUEST_INVALID_DRAW, "draw is not found or bet timing is not right");
}

function parseWalletBetResponse(res) {
    return {
        walletTrxId: 1,
        walletCode: 0,
        ok: true
    }
}

async function walletBetRemote(walletUrl) {
    return (gameTrxId, amount) => {
        return catchHttpError(request.post(walletUrl).query({ trxId: gameTrxId, amount }).retry().timeout(3000));
    };
}

async function sendRequestToWallet(dbpool, betId, amount, walletBetRemote) {
    let gameTrxId = undefined;
    try {
        gameTrxId = await db.insertWalletBet(dbpool, betId, amount);
        await db.updateBetStatusToPayReqSent(dbpool, betId);
        const res = await walletBetRemote(gameTrxId, amount);
        const result = parseWalletBetResponse(res);
        await db.updateWalletBet(dbpool, result.walletTrxId, result.walletCode, 0, gameTrxId);
        if (result.ok) {
            await db.updateBetStatusToPayResGot(dbpool, betId);
        }
        return (!!result.ok);
    } catch (err) {
        console.error("failed to send request to wallet", err);
        if (gameTrxId) {
            await db.updateWalletBet(dbpool, undefined, undefined, err.code, gameTrxId);
        }
        throw err;
    }
}

module.exports = userBet;

if (require.main === module) {
    const fakeRemote = function () {
        return ({
            walletTrxId: 1,
            walletCode: 0,
            ok: true
        });
    }

    const { checkedDbPool } = require('../db')
    const CONNECTION_STRING = 'postgres://postgres:111111@localhost/mgames';
    async function test() {
        const pool = await checkedDbPool(CONNECTION_STRING);
        const result = await sendRequestToWallet(pool, 4, 9, fakeRemote);
        console.log(`result:${result}`);
        pool.end(() => { console.log("close db pool") });
    }
    test();


}
