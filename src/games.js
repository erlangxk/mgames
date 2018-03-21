const { checkBets } = require('./games/horseracing');

const games = {
    "horseracing": {
        checkBets: checkBets,
    }
}

function validateBets(game, bets) {
    return games[game].checkBets(bets);
}


if(require.main === module){
    const r = validateBets("horseracing",{"12":5});
    console.log(r);
}