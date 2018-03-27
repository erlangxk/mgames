const http = require('http');
const Koa = require('koa');
const api = require('./api');
const mountDeps = require('./deps');
const PORT = 3000;

require('dotenv').config();

function mountRoutes(app) {
    app.use(async (ctx, next) => {
        const start = Date.now();
        ctx.state.requestTime = start;
        await next();
        const delta = Math.ceil(Date.now() - start);
        ctx.set('X-Response-Time', `${delta} ms`);
    });

    app.use(api.routes());

    app.use(async (ctx, next) => {
        ctx.body = 'PONG';
    });
}

async function bootstrap(app) {
    const dispose = await mountDeps(app.context);
    mountRoutes(app);
    const server = http.createServer(app.callback());
    server.on('close', () => {
        console.log("http server is closing.");
        dispose();
    });
    return server.listen(PORT);
}

const app = new Koa();
module.exports = app;

if (require.main === module) {
    bootstrap(app).then(server => {
        console.log(`server is listening at ${JSON.stringify(server.address())}`);
    }).catch(err => {
        console.error(err);
    })
}