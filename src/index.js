const http = require('http');
const Koa = require('koa');
const app = module.exports = new Koa();
const api = require('./api');
const pg = require('./db');
const CONNECTION_STRING = 'postgres://postgres:111111@localhost/postgres';
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
    pg(CONNECTION_STRING).then( db => {
        app.context.dbpool = db.pool;
        const server = http.createServer(app.callback());
        server.on('close',()=>{
            db.close(()=>{
                console.log("database pool is closing.");
            });
            console.log("http server is closing.");
        });
        server.listen(PORT, () => {
            console.log(`listening to port:${PORT}`);
        });
    });
}