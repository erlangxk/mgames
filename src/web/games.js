const { checkBets: horseracingCheckBets } = require('../games/horseracing');

const games = {
    "horse": {
        checkBets: horseracingCheckBets,
    }
}

function validateBets(game, json) {
    const result = games[game].checkBets(json);
    if (result !== undefined) {
        return Promise.resolve({ json, ...result });
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