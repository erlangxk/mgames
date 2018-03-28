
exports.seed = function (knex, Promise) {
  // Deletes ALL existing entries
  return knex('draws').del()
    .then(function () {
      // Inserts seed entries
      const now = Date.now();
      const paytable = {
        '12': 8,
        '13': 3,
        '14': 4,
        '15': 60,
        '16': 5,
        '23': 125,
        '24': 20,
        '25': 30,
        '26': 100,
        '34': 80,
        '35': 250,
        '36': 10,
        '45': 500,
        '46': 1000,
        '56': 175
      };
      const data = [
        { draw_create_time: now, bet_start_time: now, bet_end_time: now + 1000 * 60 * 24 * 365, game_id: 1, data: paytable },
      ];
      return knex('draws').insert(data);
    });
};
