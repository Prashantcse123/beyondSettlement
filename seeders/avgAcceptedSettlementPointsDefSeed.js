const staticData = require('../staticData/avgAcceptedSettlementPointsDefData');

module.exports = {
  up(queryInterface, Sequelize) {
    const date = new Date();

    staticData.forEach((sd) => {
      sd.createdAt = date;
      sd.updatedAt = date;
    });

    queryInterface.bulkDelete('AvgAcceptedSettlementPointsDefs', null, {});
    return queryInterface.bulkInsert('AvgAcceptedSettlementPointsDefs', staticData, {});
  },

  down(queryInterface, Sequelize) {
    // return queryInterface.bulkDelete('Person', null, {});
  },
};
