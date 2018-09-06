module.exports = {
  up(queryInterface) {
    const statuses = ['pending review', 'confirmed', 'completed'].map(status => ({
      StatusName: status,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    return queryInterface.bulkInsert('TradelinesStatuses', statuses, {});
  },

  down(queryInterface) {
    return queryInterface.bulkDelete('TradelinesStatuses', null, {});
  },
};
