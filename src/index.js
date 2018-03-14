const Koa = require('koa');
const app = module.exports = new Koa();

const PORT = 3000;

app.use(async function(ctx){
    ctx.body = 'Hello World';
});

if(!module.parent){
    app.listen(PORT, ()=>{
        console.log(`listening to port:${PORT}`);
    });
}