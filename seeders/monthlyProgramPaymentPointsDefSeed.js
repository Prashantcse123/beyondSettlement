const staticData = require('../staticData/monthlyProgramPaymentPointsDefData');

module.exports = {
  up: function (queryInterface, Sequelize) {

    let date = new Date();

    staticData.forEach(sd => {
      sd.createdAt = date;
      sd.updatedAt = date;
    });

    queryInterface.bulkDelete('MonthlyProgramPaymentPointsDefs', null, {});
    return queryInterface.bulkInsert('MonthlyProgramPaymentPointsDefs', staticData, {});
  },

  down: function (queryInterface, Sequelize) {
      // return queryInterface.bulkDelete('Person', null, {});
  }
};
