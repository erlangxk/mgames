const Router = require('koa-router');
const router = new Router({ prefix: "/api" });

const parse = require('co-body');
const { insertBets } = require('./db');

router.post('/bet/:draw/:token', async (ctx, next) => {
    //varify the token, and get the user info
    //verify the draw
    const json = await parse.json(ctx);
    const userId = await validateToken(ctx.params.token);
    const draw = await validateDraw(ctx.params.draw);
    const bets = await validateBet(json);
    const betId = await insertBets(ctx.dbpool, userId, draw.drawId, bets.amount, bets.json, ctx.state.requestTime);
    ctx.body = `calling /api/bet ${draw}, ${ctx.params.token}, ${JSON.stringify(json)}, ${betId}`;
});


async function validateToken(token) {
    return 1;
}

async function validateDraw(drawId) {
    return {
        drawId: 1,
        game: "horseracing"
    };
}

async function validateBet(json) {
    return {
        json,
        amount: 301.00,
    };
}

module.exports = router;