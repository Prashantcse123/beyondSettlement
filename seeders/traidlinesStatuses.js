module.exports = {
  up: function (queryInterface) {
    const statuses = ['pending review', 'confirmed', 'completed'].map(status => ({
      StatusName: status,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    return queryInterface.bulkInsert('TradelinesStatuses', statuses, {});
  },

  down: function (queryInterface) {
    return queryInterface.bulkDelete('TradelinesStatuses', null, {});
  },
};
