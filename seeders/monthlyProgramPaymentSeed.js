const staticData = require('../staticData/monthlyProgramPaymentData');

module.exports = {
  up: function (queryInterface, Sequelize) {

    let date = new Date();

    staticData.forEach(sd => {
      sd.createdAt = date;
      sd.updatedAt = date;
    });

    queryInterface.bulkDelete('MonthlyProgramPayments', null, {});
    return queryInterface.bulkInsert('MonthlyProgramPayments', staticData, {});
  },

  down: function (queryInterface, Sequelize) {
      // return queryInterface.bulkDelete('Person', null, {});
  }
};
