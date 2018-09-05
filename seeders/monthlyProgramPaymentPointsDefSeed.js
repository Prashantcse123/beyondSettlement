const staticData = require('../staticData/monthlyProgramPaymentPointsDefData');

module.exports = {
  up(queryInterface) {
    const date = new Date();

    staticData.forEach((sd) => {
      sd.createdAt = date;
      sd.updatedAt = date;
    });

    queryInterface.bulkDelete('MonthlyProgramPaymentPointsDefs', null, {});

    return queryInterface.bulkInsert('MonthlyProgramPaymentPointsDefs', staticData, {});
  },

  down() {
    // return queryInterface.bulkDelete('Person', null, {});
  },
};
