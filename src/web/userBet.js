const db = require('../db');
const bodyParser = require('co-body');
const lodash = require('lodash');
const games = require('./games');
const { parseJwtToken } = require('./request');
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
        const betId = await db.insertBets(dbpool, userId, draw.drawId, bets.amount, bets.json, betTime);
        //insert wallet request into database.
        //send request to deduct money
        //update wallet request

        ctx.body = Request.ok(`calling /api/bet ${draw}, ${ctx.params.token}, ${JSON.stringify(json)}, ${betId}`);
    } catch (err) {
        ctx.state.log.info(err);
        return ctx.throw(400);
    }
}

async function validateToken(ctx) {
    const jwtSecret = ctx.configs.jwtSecret;
    const token = ctx.query.token;
     //const token = parseJwtToken(ctx.header);
    const log = ctx.state.log;
    const result = await jwtVerifyAsync(token, jwtSecret);
    const userId = result.id;
    const log2 = log.child({ userId });
    ctx.state.log = log2;
    return userId;
}

async function validateDraw(ctx) {
    const drawId = ctx.params.draw;
    const dbpool = ctx.configs.dbpool;
    const betTime = ctx.state.requestTime;
    const result = await db.loadDraw(dbpool, drawId, betTime)
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

async function sendRequestToWallet(dbpool, walletUrl, drawId, betId, amount) {
    try {
        const gameTrxId = await insertWalletBet(dbpool, betId, amount);
        await updateBetStatus(dbpool, betId, BetStatus.PAY_REQ_SENT, BetStatus.CREATED);
        const res = request.post(walletUrl).query({ trxId: gameTrxId, amount, drawId, betId }).retry().timeout(3000);
        const result = parseWalletBetResponse(res);
        await updateWalletBet(dbpool, result.walletTrxId, result.walletCode, 0, result.trxId);
        if (result.ok) {
            await updateBetStatus(betId, BetStatus.PAY_RES_GOT, BetStatus.PAY_REQ_SENT);
        }
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

module.exports = userBet;
