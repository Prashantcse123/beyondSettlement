const staticData = require('../staticData/accountStatusPointsDefData');

module.exports = {
  up(queryInterface) {
    const date = new Date();

    staticData.forEach((sd) => {
      sd.createdAt = date;
      sd.updatedAt = date;
    });

    queryInterface.bulkDelete('AccountStatusPointsDefs', null, {});

    return queryInterface.bulkInsert('AccountStatusPointsDefs', staticData, {});
  },

  down() {
    // return queryInterface.bulkDelete('Person', null, {});
  },
};
