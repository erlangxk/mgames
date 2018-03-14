const INSERT_BETS = 'insert into bets (user_id, draw_id, bet_amount, json, bet_time, create_time) values (?,?,?,?)';
/*JSON{
    12: 4,
    34: 6,
}*/
//const INSERT_BET_WALLET_REQ
//const INSERT_BET_WALLET_RES

const INSERT_PAYOUTS = 'insert into payouts(user_id, draw_id, payout_amount, json,payout_time,create_time) values (?,?,?,?)';

/*JSON {
    123456: {12:40, 36:50},
}*/

//const INSERT_PAYOUT_WALLET_REQ
//const INSERT_PAYOUT_WALLET_RES

//const INSERT DRAW (draw_id, game_id, start_time, end_time, create_time)
//const INSERT DRAW_PAY_TABLE (draw_id, json,create_time)
//const INSERT DRAW_RESULT(draw_id, create_time, result)
