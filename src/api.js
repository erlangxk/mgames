var Router = require('koa-router');
var router = new Router();

router.get('/', async (ctx, next) => {
    ctx.body = 'Hello World';
})

module.exports = router;