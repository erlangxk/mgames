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

    const authTokenUrl = process.env.AUTH_TOKEN_URL;
    if (lodash.isEmpty(authTokenUrl)) {
        throw new Error('AUTH_TOKEN_URL is not configured');
    }

    const walletBetUrl = process.env.WALLET_BET_URL;
    if (lodash.isEmpty(walletBetUrl)) {
        throw new Error('WALLET_BET_URL is not configured');
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (lodash.isEmpty(jwtSecret)) {
        throw new Error('JWT_SECRET is not configured');
    }

    const operatorId = process.env.OPERATOR_ID;
    if (lodash.isEmpty(operatorId)) {
        throw new Error('OPERATOR_ID is not configured');
    }

    try {
        const dbpool = await checkedDbPool(pgConnStr);
        context.configs = {
            dbpool,
            authTokenUrl,
            walletBetUrl,
            jwtSecret,
            operatorId
        };
        return function () {
            if (dbpool) dbpool.end();
        };
    } catch (err) {
        throw err;
    }
}

module.exports = mountDeps;