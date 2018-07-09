const staticData = require('../staticData/fundAccumulationPctPointsDefData');

module.exports = {
  up: function (queryInterface, Sequelize) {

    let date = new Date();

    staticData.forEach(sd => {
      sd.createdAt = date;
      sd.updatedAt = date;
    });

    queryInterface.bulkDelete('FundAccumulationPctPointsDefs', null, {});
    return queryInterface.bulkInsert('FundAccumulationPctPointsDefs', staticData, {});
  },

  down: function (queryInterface, Sequelize) {
      // return queryInterface.bulkDelete('Person', null, {});
  }
};
