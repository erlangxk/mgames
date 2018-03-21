const { checkBets } = require('./games/horseracing');

const games = {
    "horseracing": {
        checkBets: checkBets,
    }
}

function validateBets(game, json) {
    const amount = games[game].checkBets(json);
    if (amount !== undefined) {
        return Promise.resolve({ json, amount });
    }
    return Promise.reject(new Error("bets are not valid"))
}

module.exports = {
    validateBets
}

if (require.main === module) {
    const r = validateBets("horseracing", { "1": 5 });
    console.log(r);
}