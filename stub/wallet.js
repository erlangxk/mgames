const uuidv1 = require('uuid/v1');

async function debit(userId, gameTrxId, amount) {
    console.log({ userId, gameTrxId, amount });
    return {
        walletTrxId: uuidv1(),
        walletReturnCode: 0,
        gameTrxId
    };
}

module.exports = {
    debit
};