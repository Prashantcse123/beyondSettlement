const staticData = require('../staticData/firstMonthFeeFundPctData');

module.exports = {
  up: function (queryInterface, Sequelize) {

    let date = new Date();

    staticData.forEach(sd => {
      sd.createdAt = date;
      sd.updatedAt = date;
    });

    queryInterface.bulkDelete('FirstMonthFeeFundPcts', null, {});
    return queryInterface.bulkInsert('FirstMonthFeeFundPcts', staticData, {});
  },

  down: function (queryInterface, Sequelize) {
      // return queryInterface.bulkDelete('Person', null, {});
  }
};
