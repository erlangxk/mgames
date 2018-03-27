const db = require('../db');
const bodyParser = require('co-body');
const lodash = require('lodash');
const games = require('./games');

async function userBet(ctx, next) {
    try {
        const betTime = ctx.state.requestTime;
        const json = await bodyParser.json(ctx);
        const userId = await validateToken(ctx.configs.jwtSecret, ctx.params.token);
        const draw = await validateDraw(ctx.params.draw, betTime, ctx.dbpool);
        const bets = await games.validateBets(draw.game, json);
        const betId = await db.insertBets(ctx.dbpool, userId, draw.drawId, bets.amount, bets.json, betTime);
        //insert wallet request into database.
        //send request to deduct money
        //update wallet request

        ctx.body = `calling /api/bet ${draw}, ${ctx.params.token}, ${JSON.stringify(json)}, ${betId}`;
    } catch (err) {
        return ctx.throw(400);
    }
}

async function validateToken(jwtSecret, token) {
    return jwtVerifyAsync(token, jwtSecret);
}

async function validateDraw(drawId, betTime, dbpool) {
    loadDraw(dbpool, drawId, betTime).then(result => {
        if (result != undefined) {
            return Promise.resolve({ drawId, game: result });
        }
        return Promise.reject(new Error("draw is not found, or bet timing is not right"));
    });
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
