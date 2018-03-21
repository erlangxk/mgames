const Router = require('koa-router');
const router = new Router({ prefix: "/api" });

const parse = require('co-body');
const { insertBets, loadDraw } = require('./db');
const { validateBets } = require('/games');

router.post('/bet/:draw/:token', async (ctx, next) => {
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
    return 1;
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