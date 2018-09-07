module.exports = {
  up: async (queryInterface) => {
    /* TODO change tradeline id columns to make relations */
    await queryInterface.removeColumn('ScorecardRecords', 'isDone');
  },

  down: () => {},
};
