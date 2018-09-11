const staticData = require('../staticData/weightDefData');

module.exports = {
  up(queryInterface) {
    const date = new Date();

    staticData.forEach((sd) => {
      sd.createdAt = date;
      sd.updatedAt = date;
    });

    queryInterface.bulkDelete('WeightDefs', null, {});

    return queryInterface.bulkInsert('WeightDefs', staticData, {});
  },

  down() {
    // return queryInterface.bulkDelete('Person', null, {});
  },
};
