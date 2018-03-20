const redis = require('redis');

const retry = {
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
};
const client = redis.createClient(retry);
const client2 = redis.createClient(retry);


client.on('error', function (err) {
    console.log("redis client error",err);
});

function channel(gameId) {
    return `GAME_CHANNEL_${gameId}`;
}

function publish(client, gameId, data) {
    client.publish(channel(gameId), JSON.stringify(data));
}

function test() {
    client.ping((err, reply) => {
        if (err) {
            console.error(err);
        } else {
            console.log(reply);
        }
    });

    client.on("message",function(channel,message){
        console.log(message);
        client.quit();
        client2.quit();
    })

    client.on("subscribe",function(channel, count){
        publish(client2, 1, { a: 3 });    
        publish(client2, 1, { a: 4 });    
    });

    client.subscribe(channel(1));
}

test();