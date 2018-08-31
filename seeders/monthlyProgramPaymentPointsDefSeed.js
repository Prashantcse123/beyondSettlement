const staticData = require('../staticData/monthlyProgramPaymentPointsDefData');

module.exports = {
  up(queryInterface, Sequelize) {
    const date = new Date();

    staticData.forEach((sd) => {
      sd.createdAt = date;
      sd.updatedAt = date;
    });

    queryInterface.bulkDelete('MonthlyProgramPaymentPointsDefs', null, {});
    return queryInterface.bulkInsert('MonthlyProgramPaymentPointsDefs', staticData, {});
  },

  down(queryInterface, Sequelize) {
    // return queryInterface.bulkDelete('Person', null, {});
  },
};
