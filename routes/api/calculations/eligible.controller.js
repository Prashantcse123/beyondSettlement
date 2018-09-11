const models = require('../../../models');
const eligibleAccountsFilter = require('../../../logic/calculations/eligibleAccountsFilter');
const eligibleAccountsCalculationsLogic = require('../../../logic/calculations/eligibleAccountsCalculations');
const Helper = require('./Helper');
const startEligibilityCalculation = (req, res) => {
  Promise.resolve()
    .then(() => eligibleAccountsCalculationsLogic.setData());

  res.status(200).json('Calculation started....');
};

const getEligibleAccounts = (req, res) => {
  const options = {};
  const completeOptions = Helper.completeData(req);
  [options.order, options.where, options.offset, options.limit, options.include] = [completeOptions.order, completeOptions.where, completeOptions.offset, completeOptions.order, completeOptions.include];
  eligibleAccountsFilter.getEligibleScorecardRecords(options).then(async (rows) => {
    let totalCount = 0;
    const rowsToCount = await eligibleAccountsFilter.getEligibleScorecardRecords();
    totalCount = rowsToCount.length;
    const response = Helper.responseHandler(rows, completeOptions.page, completeOptions.pageSize, totalCount);
    res.status(200).json(response);
  });
};

module.exports = {
  startEligibilityCalculation,
  getEligibleAccounts,
};
