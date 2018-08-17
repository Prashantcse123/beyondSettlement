const staticData = require('../staticData/settlementTermPointsDefData');

module.exports = {
  up(queryInterface, Sequelize) {
    const date = new Date();

    staticData.forEach((sd) => {
      sd.createdAt = date;
      sd.updatedAt = date;
    });

    queryInterface.bulkDelete('SettlementTermPointsDefs', null, {});
    return queryInterface.bulkInsert('SettlementTermPointsDefs', staticData, {});
  },

  down(queryInterface, Sequelize) {
    // return queryInterface.bulkDelete('Person', null, {});
  },
};
