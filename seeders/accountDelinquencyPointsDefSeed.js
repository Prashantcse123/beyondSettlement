const staticData = require('../staticData/accountDelinquencyPointsDefData');

module.exports = {
  up(queryInterface) {
    const date = new Date();

    staticData.forEach((sd) => {
      sd.createdAt = date;
      sd.updatedAt = date;
    });

    queryInterface.bulkDelete('AccountDelinquencyPointsDefs', null, {});

    return queryInterface.bulkInsert('AccountDelinquencyPointsDefs', staticData, {});
  },

  down() {
    // return queryInterface.bulkDelete('Person', null, {});
  },
};
