const http = require('http');
const Koa = require('koa');
const api = require('./api');
const uuid = require('uuid');
const bunyan = require('bunyan');
const log = bunyan.createLogger({
    name: 'mgames',
    src: true,
    serializers: bunyan.stdSerializers
});
const mountDeps = require('./deps');

require('dotenv').config();

function mountRoutes(app) {
    app.use(async (ctx, next) => {
        const start = Date.now();
        ctx.state.requestTime = start;
        ctx.state.log = log.child({ reqId: uuid() });
        await next();
        const delta = Math.ceil(Date.now() - start);
        ctx.set('X-Response-Time', `${delta} ms`);
    });

    app.use(api.routes());

    app.use(async (ctx, next) => {
        ctx.body = 'PONG';
    });

    app.on('error', err => {
        log.error(err);
    });
}

async function bootstrap(app) {
    const dispose = await mountDeps(app.context);
    mountRoutes(app);
    const server = http.createServer(app.callback());
    server.on('close', () => {
        log.info("http server is closing.");
        dispose();
    });
    return server.listen(3000);
}

const app = new Koa();
module.exports = app;

if (require.main === module) {
    bootstrap(app).then(server => {
        log.info(`server is listening at port:${server.address().port}`);
    }).catch(err => {
        log.info(err, 'server failed to start');
    })
}