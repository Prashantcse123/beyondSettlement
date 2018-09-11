const staticData = require('../staticData/settlementTermPointsDefData');

module.exports = {
  up(queryInterface) {
    const date = new Date();

    staticData.forEach((sd) => {
      sd.createdAt = date;
      sd.updatedAt = date;
    });

    queryInterface.bulkDelete('SettlementTermPointsDefs', null, {});

    return queryInterface.bulkInsert('SettlementTermPointsDefs', staticData, {});
  },

  down() {
    // return queryInterface.bulkDelete('Person', null, {});
  },
};
