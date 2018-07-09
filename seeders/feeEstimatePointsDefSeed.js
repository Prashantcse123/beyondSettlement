const staticData = require('../staticData/feeEstimatePointsDefData');

module.exports = {
  up: function (queryInterface, Sequelize) {

    let date = new Date();

    staticData.forEach(sd => {
      sd.createdAt = date;
      sd.updatedAt = date;
    });

    queryInterface.bulkDelete('FeeEstimatePointsDefs', null, {});
    return queryInterface.bulkInsert('FeeEstimatePointsDefs', staticData, {});
  },

  down: function (queryInterface, Sequelize) {
      // return queryInterface.bulkDelete('Person', null, {});
  }
};
