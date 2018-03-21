const { checkBets, winBetType, randomResult } = require('./index');

describe('check bets', () => {

    test('should pass bets checking', () => {
        const bets = {
            "12": 3,
            "34": 5,
        };
        expect(checkBets(bets)).toBe(8);
    });

    test('should not pass, bet is bigger than 80 ', () => {
        const bets = {
            "12": 3,
            "34": 81,
        };
        expect(checkBets(bets)).toBe(undefined);
    });

    test('should not pass, key is not right', () => {
        const bets = {
            "1": 3,
            "34": 5,
        };
        expect(checkBets(bets)).toBe(undefined);
    });

    test('should not pass, value is not right', () => {
        var bets = {
            "12": 3.1,
            "34": 5,
        };
        expect(checkBets(bets)).toBe(undefined);
        bets = {
            "12": "3",
            "34": 5,
        };
        expect(checkBets(bets)).toBe(undefined);
    });

    test('get bet type by odds', () => {
        const paytable = {
            '12': 5,
            '13': 125,
            '14': 20,
            '15': 80,
            '16': 10,
            '23': 3,
            '24': 30,
            '25': 8,
            '26': 100,
            '34': 1000,
            '35': 4,
            '36': 175,
            '45': 250,
            '46': 60,
            '56': 500
        };
        expect(winBetType(paytable, 100)).toBe('26');
        expect(winBetType(paytable, 175)).toBe('36');
        expect(winBetType(paytable, 155)).toBe(undefined);
    });

    test.skip("rtp", () => {
        let total = 0;
        const i = 100000000;
        for (let n = 0; n < i; n++) {
            total += randomResult();
        }
        const cost = 15 * i;
        const rtp = 42000 / 48365;
        expect(total / cost).toBeCloseTo(rtp, 3);
    });
});