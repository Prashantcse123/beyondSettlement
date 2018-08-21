const staticData = require('../staticData/accountDelinquencyPointsDefData');

module.exports = {
  up: function (queryInterface, Sequelize) {

    let date = new Date();

    staticData.forEach(sd => {
      sd.createdAt = date;
      sd.updatedAt = date;
    });

    queryInterface.bulkDelete('AccountDelinquencyPointsDefs', null, {});
    return queryInterface.bulkInsert('AccountDelinquencyPointsDefs', staticData, {});
  },

  down: function (queryInterface, Sequelize) {
      // return queryInterface.bulkDelete('Person', null, {});
  }
};
