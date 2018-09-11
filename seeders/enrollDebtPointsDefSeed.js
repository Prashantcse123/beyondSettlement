const staticData = require('../staticData/enrollDebtPointsDefData');

module.exports = {
  up(queryInterface) {
    const date = new Date();

    staticData.forEach((sd) => {
      sd.createdAt = date;
      sd.updatedAt = date;
    });

    queryInterface.bulkDelete('EnrollDebtPointsDefs', null, {});

    return queryInterface.bulkInsert('EnrollDebtPointsDefs', staticData, {});
  },

  down() {
    // return queryInterface.bulkDelete('Person', null, {});
  },
};
