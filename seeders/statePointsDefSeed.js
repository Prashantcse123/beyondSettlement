const staticData = require('../staticData/statePointsDefData');

module.exports = {
  up: function (queryInterface, Sequelize) {

    let date = new Date();

    staticData.forEach(sd => {
      sd.createdAt = date;
      sd.updatedAt = date;
    });

    queryInterface.bulkDelete('StatePointsDefs', null, {});
    return queryInterface.bulkInsert('StatePointsDefs', staticData, {});
  },

  down: function (queryInterface, Sequelize) {
      // return queryInterface.bulkDelete('Person', null, {});
  }
};
