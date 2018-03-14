
const Koa = require('koa');
const app = module.exports = new Koa();
const api = require('./api');

const PORT = 3000;

app.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    const delta = Math.ceil(Date.now() - start);
    ctx.set('X-Response-Time', `${delta} ms`);
});

app.use(api.routes());

app.use(async (ctx, next) => {
    ctx.body = 'Hello World';
});

if (!module.parent) {
    app.listen(PORT, () => {
        console.log(`listening to port:${PORT}`);
    });
    app.listen(3333, () => {
        console.log(`listening to port:3333`);
    });
}