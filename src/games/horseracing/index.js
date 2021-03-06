const lodash = require('lodash');

const ALLOWED_BET_TYPES = new Set(["12", "13", "14", "15", "16", "23", "24", "25", "26", "34", "35", "36", "45", "46", "56"]);
const PAYOUTS = [3, 4, 5, 8, 10, 20, 30, 60, 80, 100, 125, 175, 250, 500, 1000];
const MAX_BET = 80;

function shuffle(array) {
    const arr2 = array.slice();
    for (let i = arr2.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const x = arr2[i];
        arr2[i] = arr2[j];
        arr2[j] = x;
    }
    return arr2;
}

function zip(payouts, betTypes) {
    const result = {};
    let i = 0;
    for (const b of betTypes) {
        result[b] = payouts[i++];
    }
    return Object.freeze(result);
}

function randomPaytable() {
    const shufffled_payouts = shuffle(PAYOUTS);
    return zip(shufffled_payouts, ALLOWED_BET_TYPES);
}

function winBetType(paytable, odds) {
    for (const [k, v] of Object.entries(paytable)) {
        if (v === odds) return k;
    }
    return undefined;
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function randomResult() {
    const max = 48365;
    const r = getRandomInt(max);
    let upper = 14000;
    if (r < upper) {
        return 3;
    }
    upper += 10500;
    if (r < upper) {
        return 4;
    }
    upper += 8400;
    if (r < upper) {
        return 5;
    }
    upper += 5250;
    if (r < upper) {
        return 8;
    }
    upper += 4200;
    if (r < upper) {
        return 10;
    }
    upper += 2100;
    if (r < upper) {
        return 20;
    }
    upper += 1400;
    if (r < upper) {
        return 30;
    }
    upper += 700;
    if (r < upper) {
        return 60;
    }
    upper += 525;
    if (r < upper) {
        return 80;
    }
    upper += 420;
    if (r < upper) {
        return 100;
    }
    upper += 336;
    if (r < upper) {
        return 125;
    }
    upper += 240;
    if (r < upper) {
        return 175;
    }
    upper += 168;
    if (r < upper) {
        return 250;
    }
    upper += 84;
    if (r < upper) {
        return 500;
    }
    upper += 42;
    if (r < upper) {
        return 1000;
    }
}

function checkBets(bets) {
    let total = 0;
    let amount = 0;
    for (const [k, v] of Object.entries(bets)) {
        if (ALLOWED_BET_TYPES.has(k) && lodash.isInteger(v) && v > 0 && v <= MAX_BET) {
            amount += v;
            total += 1;
            continue;
        }
        return undefined;
    }
    return { total, amount };
}

module.exports = {
    checkBets,
    winBetType,
    randomResult,
    randomPaytable
}

function testRandonPayout() {
    const i = 1000000;
    const m = new Map();
    for (let n = 0; n < i; n++) {
        let rp = randomPaytable();
        for (const [k, v] of Object.entries(rp)) {
            const m2 = m.get(k);
            if (m2 === undefined) {
                let mm = new Map();
                mm.set(v, 1);
                m.set(k, mm)
            } else {
                let freq = m2.get(v);
                if (freq == undefined) {
                    m2.set(v, 1);
                } else {
                    m2.set(v, freq + 1);
                }
            }
        }
    }
    console.log(m);
}

function testRandomResult() {
    let total = 0;
    const i = 100000000;
    for (let n = 0; n < i; n++) {
        total += randomResult();
    }
    const cost = 15 * i;
    const rtp = 42000 / 48365;
    console.log(`total/cost=${total / cost}`);
    console.log(`rtp=${rtp}`);
}

if (require.main === module) {
    const p = randomPaytable();
    console.log(p);
}