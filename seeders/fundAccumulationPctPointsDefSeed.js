const staticData = require('../staticData/fundAccumulationPctPointsDefData');

module.exports = {
  up(queryInterface) {
    const date = new Date();

    staticData.forEach((sd) => {
      sd.createdAt = date;
      sd.updatedAt = date;
    });

    queryInterface.bulkDelete('FundAccumulationPctPointsDefs', null, {});

    return queryInterface.bulkInsert('FundAccumulationPctPointsDefs', staticData, {});
  },

  down() {
    // return queryInterface.bulkDelete('Person', null, {});
  },
};
