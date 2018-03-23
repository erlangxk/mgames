"use strict";
const http = require('http');
const Koa = require('koa');
const app = new Koa();
const PORT = 8888;

const Router = require('koa-router');
const router = new Router({ prefix: "/api" });

router.all('/balance/add', async (ctx, next) => {
    ctx.body = "aaa";
});

app.use(router.routes());
app.use(async (ctx, next) => {
    ctx.body = 'Hello World';
});

if (require.main === module) {
    const server = http.createServer(app.callback());
    server.listen(PORT, () => {
        console.log(`listening to port:${PORT}`);
    });
}

module.exports = app;