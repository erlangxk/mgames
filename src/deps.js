const { checkedDbPool } = require('./db');
const lodash = require('lodash');

//check env (db_connect_string, redis_connect_string);
//check dbpool, ping
//check redis,ping
//check env (authUrl, walletUrl)
//check jwt secret
//check operatorId

async function mountDeps(context) {
    const pgConnStr = process.env.POSTGRES_CONN;
    if (lodash.isEmpty(pgConnStr)) {
        throw new Error('POSTGRES_CONN is not configured');
    }
    let dbpool = undefined;
    try {
        dbpool = await checkedDbPool(pgConnStr);
    } catch (err) {
        console.log(`postgresql connect error:${pgConnStr}`);
        throw err;
    }

    const authUrl = process.env.AUTH_URL;
    if (lodash.isEmpty(authUrl)) {
        throw new Error('AUTH_URL is not configured');
    }

    const walletUrl = process.env.WALLET_URL;
    if (lodash.isEmpty(walletUrl)) {
        throw new Error('WALLET_URL is not configured');
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (lodash.isEmpty(jwtSecret)) {
        throw new Error('JWT_SECRET is not configured');
    }

    const operatorId = process.env.OPERATOR_ID;
    if (lodash.isEmpty(operatorId)) {
        throw new Error('OPERATOR_ID is not configured');
    }

    context.configs = {
        dbpool,
        authUrl,
        walletUrl,
        jwtSecret,
        operatorId
    }

    return function () {
        if (dbpool) dbpool.end();
    }
}

module.exports = mountDeps;