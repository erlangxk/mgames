const Router = require('koa-router');
const router = new Router({ prefix: "/api" });
const parse = require('co-body');

function firstQuery(pool) {
    return pool.query('select * from bets');
 }

router.post('/bet/:draw/:token', async (ctx, next) => {
    const draw = ctx.params.draw;
    const token = ctx.params.token;
    //varify the token, and get the user info
    //verify the draw
    const json = await parse.json(ctx);
    const result = await firstQuery(ctx.dbpool);
    const bets_json = JSON.stringify(result.rows[0].bets_json);
    ctx.body = `calling /api/bet ${draw}, ${token}, ${JSON.stringify(json)}, ${bets_json}`;
});


function validateToken(token){
    return "user1";
}

function validateDraw(drawId){
    return {
        drawId:1,
        game:"horseracing"
    };
}

module.exports = router;