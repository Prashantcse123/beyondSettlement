const scorecardCalculationsLogic = require('../calculations/scorecardCalculations');
const eligibleAccountsCalculationsLogic = require('../calculations/eligibleAccountsCalculations');

(async () => {
  await scorecardCalculationsLogic.setData();
  await eligibleAccountsCalculationsLogic.setData();
})();
