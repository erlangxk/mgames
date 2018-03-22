const http = require('http');
const Koa = require('koa');
const api = require('./api');
const { checkedDbPool } = require('./db');
const CONNECTION_STRING = 'postgres://postgres:111111@localhost/postgres';
const PORT = 3000;

function install(app) {
    app.use(async (ctx, next) => {
        const start = Date.now();
        ctx.state.requestTime = start;
        await next();
        const delta = Math.ceil(Date.now() - start);
        ctx.set('X-Response-Time', `${delta} ms`);
    });

    app.use(api.routes());

    app.use(async (ctx, next) => {
        ctx.body = 'Hello World';
    });
}

async function bootstrap(app) {
    install(app);
    // const db = await checkedDbPool(CONNECTION_STRING);
    // app.context.dbpool = db;
    const server = http.createServer(app.callback());
    server.on('close', () => {
        console.log("http server is closing.");
        db.end(() => {
            console.log("database pool is closing.");
        });
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