const staticData = require('../staticData/importedActiveAccountsData');

module.exports = {
  up(queryInterface, Sequelize) {
    const date = new Date();

    staticData.forEach((sd) => {
      sd.createdAt = date;
      sd.updatedAt = date;
    });

    queryInterface.bulkDelete('ImportedActiveAccounts', null, {});
    return queryInterface.bulkInsert('ImportedActiveAccounts', staticData, {});
  },

  down(queryInterface, Sequelize) {
    // return queryInterface.bulkDelete('Person', null, {});
  },
};
