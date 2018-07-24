const staticData = require('../staticData/firstMonthFeeFundPctPointsDefData');

module.exports = {
  up: function (queryInterface, Sequelize) {

    let date = new Date();

    staticData.forEach(sd => {
      sd.createdAt = date;
      sd.updatedAt = date;
    });

    queryInterface.bulkDelete('FirstMonthFeeFundPctPointsDefs', null, {});
    return queryInterface.bulkInsert('FirstMonthFeeFundPctPointsDefs', staticData, {});
  },

  down: function (queryInterface, Sequelize) {
      // return queryInterface.bulkDelete('Person', null, {});
  }
};
