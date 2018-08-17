const staticData = require('../staticData/accountStatusPointsDefData');

module.exports = {
  up(queryInterface, Sequelize) {
    const date = new Date();

    staticData.forEach((sd) => {
      sd.createdAt = date;
      sd.updatedAt = date;
    });

    queryInterface.bulkDelete('AccountStatusPointsDefs', null, {});
    return queryInterface.bulkInsert('AccountStatusPointsDefs', staticData, {});
  },

  down(queryInterface, Sequelize) {
    // return queryInterface.bulkDelete('Person', null, {});
  },
};
