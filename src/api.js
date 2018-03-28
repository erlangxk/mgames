const Router = require('koa-router');
const router = new Router({ prefix: "/api" });

const userBet = require('./web/userBet');
const authToken = require('./web/authToken');

router.all('/bet/:draw', userBet);
router.all('/auth/:token', authToken);

module.exports = router;