const staticData = require('../staticData/feeEstimatePointsDefData');

module.exports = {
  up(queryInterface) {
    const date = new Date();

    staticData.forEach((sd) => {
      sd.createdAt = date;
      sd.updatedAt = date;
    });

    queryInterface.bulkDelete('FeeEstimatePointsDefs', null, {});

    return queryInterface.bulkInsert('FeeEstimatePointsDefs', staticData, {});
  },

  down() {
    // return queryInterface.bulkDelete('Person', null, {});
  },
};
