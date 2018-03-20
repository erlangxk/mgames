const redis = require('redis');
const client = redis.createClient({
    retry_strategy: function (opts) {
        if (opts.error && opts.error.code === 'ECONNREFUSED') {
            return new Error('The server refused the connection');
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
            return new Error('Retry time exhausted');
        }
        if (options.attempt > 10) {
            return undefined;
        }
        return Math.min(options.attempt * 100, 3000);
    }
});

client.on('error', function (err) {
    console.log("redis client error");
});

function channel(gameId) {
    return `GAME_CHANNEL_${gameId}`;
}

function publish(client, gameId, data) {
    client.push(channel(gameId), JSON.stringify(data));
}

function test() {
    client.ping((err, reply) => {
        if (err) {
            console.error(err);
        } else {
            console.log(reply);
        }
        client.quit();
    });
}

test();