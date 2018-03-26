const { checkedDbPool } = require('./db');
const lodash = require('lodash');

//check env (db_connect_string, redis_connect_string);
//check dbpool, ping
//check redis,ping
//check env (authUrl, walletUrl)
//check jwt secret
//check operatorId

async function installDeps(context) {
    const postgresConnStr = process.env.POSTGRES_CONNECTION_STRING;
    const redisConnStr = process.env.POSTGRES_CONNECTION_STRING;
    if (lodash.isEmpty(postgresConnStr)) {
        throw new Error('postgres is not configured');
    }
    if (lodash.isEmpty(redisConnStr)) {
        throw new Error('redis is not configured');
    }

    let dbpool = undefined;
    try {
        dbpool = await checkedDbPool(postgresConnStr);
    } catch (err) {
        console.log(`postgresql connect error:${postgresConnStr}`);
        throw err;
    }

    let redis = undefined;
    try {
        redis = await checkRedis(redisConnStr);
    } catch (err) {
        console.log(`redis connect error:${redisConnStr}`);
        throw err;
    }

    const authUrl = process.env.AUTH_URL;
    const walletUrl = process.env.WALLET_URL;
    const jwtSecret = process.env.JWT_SECRET;
    const operatorId = process.env.OPERATOR_ID;

    if (lodash.isEmpty(authUrl)) {
        throw new Error('authUrl is not configured');
    }
    if (lodash.isEmpty(walletUrl)) {
        throw new Error('walletUrl is not configured');
    }
    if (lodash.isEmpty(jwtSecret)) {
        throw new Error('jwtSecret is not configured');
    }
    if (lodash.isEmpty(operatorId)) {
        throw new Error('operatorId is not configured');
    }

    context.configs = {
        dbpool,
        reids,
        authUrl,
        walletUrl,
        jwtSecret,
        operatorId
    }

    return function () {
        if (dbpool) dbpool.end();
        //if(redis)redis.colse();
    }
}