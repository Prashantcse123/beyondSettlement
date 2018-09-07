// todo: maybe remove this strange seed?
module.exports = {
  up() {
    return true;
    // removed because each time the service restarts on production it runs

    /* let date = new Date();

    staticData.forEach(sd => {
      sd.createdAt = date;
      sd.updatedAt = date;
    });

    queryInterface.bulkDelete('ImportedActiveAccounts', null, {});
    return queryInterface.bulkInsert('ImportedActiveAccounts', staticData, {}); */
  },

  down() {
    // return queryInterface.bulkDelete('Person', null, {});
  },
};
