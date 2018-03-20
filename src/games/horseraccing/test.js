const { checkBets } = require('./index');

describe('check bets', () => {

    test('should pass bets checking', () => {
        const bets = {
            "12": 3,
            "34": 5,
        };
        expect(checkBets(bets)).toBe(true);
    });

    test('should not pass, key is not right', () => {
        const bets = {
            "1": 3,
            "34": 5,
        };
        expect(checkBets(bets)).toBe(false);

    });

    test('should not pass, value is not right', () => {
        var bets = {
            "12": 3.1,
            "34": 5,
        };
        expect(checkBets(bets)).toBe(false);
        bets = {
            "12": "3",
            "34": 5,
        };
        expect(checkBets(bets)).toBe(false);
    });

});