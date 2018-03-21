const Router = require('koa-router');
const router = new Router({ prefix: "/api" });

const parse = require('co-body');
const { insertBets, loadDraw } = require('./db');
const { validateBets } = require('/games');

/*
    OPERATOR_NAME+
    GAME_NAME+
    GAME_ID = unique identity as one docker instance
    AUTH_URL
    DATABASE_URL
    REDIS_URL
*/

router.post('/auth/:token', async (ctx, next) => {
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