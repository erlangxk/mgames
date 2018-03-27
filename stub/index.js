"use strict";

const Koa = require('koa');
const app = new Koa();

const Router = require('koa-router');
const router = new Router({ prefix: "/api" });
const authToken = require('./users');
const { debit } = require('./wallet');

router.all('/auth/:token', async (ctx, next) => {
    ctx.body = await authToken(ctx.params.token);
});

router.all('/wallet/debit', async (ctx, next) => {
    const { gameTrxId, amount, userId } = ctx.query;
    ctx.body = await debit(userId, gameTrxId, amount);
});

app.use(router.routes());

app.use(async (ctx, next) => {
    ctx.body = 'PONG';
});

if (require.main === module) {
    const PORT = 8000;
    app.listen(PORT, () => {
        console.log(`listening to port:${PORT}`);
    });
}

