const staticData = require('../staticData/avgAcceptedSettlementPointsDefData');

module.exports = {
  up(queryInterface) {
    const date = new Date();

    staticData.forEach((sd) => {
      sd.createdAt = date;
      sd.updatedAt = date;
    });

    queryInterface.bulkDelete('AvgAcceptedSettlementPointsDefs', null, {});

    return queryInterface.bulkInsert('AvgAcceptedSettlementPointsDefs', staticData, {});
  },

  down() {
    // return queryInterface.bulkDelete('Person', null, {});
  },
};
