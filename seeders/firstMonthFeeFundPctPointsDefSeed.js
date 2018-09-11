const staticData = require('../staticData/firstMonthFeeFundPctPointsDefData');

module.exports = {
  up(queryInterface) {
    const date = new Date();

    staticData.forEach((sd) => {
      sd.createdAt = date;
      sd.updatedAt = date;
    });

    queryInterface.bulkDelete('FirstMonthFeeFundPctPointsDefs', null, {});

    return queryInterface.bulkInsert('FirstMonthFeeFundPctPointsDefs', staticData, {});
  },

  down() {
    // return queryInterface.bulkDelete('Person', null, {});
  },
};
