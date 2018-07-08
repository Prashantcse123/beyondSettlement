const staticData = require('../staticData/avgAcceptedSettlementPointsRangeData');

module.exports = {
  up: function (queryInterface, Sequelize) {

    let date = new Date();

    staticData.forEach(sd => {
      sd.createdAt = date;
      sd.updatedAt = date;
    });

    queryInterface.bulkDelete('AvgAcceptedSettlementPointsRanges', null, {});
    return queryInterface.bulkInsert('AvgAcceptedSettlementPointsRanges', staticData, {});
  },

  down: function (queryInterface, Sequelize) {
      // return queryInterface.bulkDelete('Person', null, {});
  }
};
