const staticData = require('../staticData/firstMonthFeeFundPctPointsDefData');

module.exports = {
  up(queryInterface, Sequelize) {
    const date = new Date();

    staticData.forEach((sd) => {
      sd.createdAt = date;
      sd.updatedAt = date;
    });

    queryInterface.bulkDelete('FirstMonthFeeFundPctPointsDefs', null, {});
    return queryInterface.bulkInsert('FirstMonthFeeFundPctPointsDefs', staticData, {});
  },

  down(queryInterface, Sequelize) {
    // return queryInterface.bulkDelete('Person', null, {});
  },
};
