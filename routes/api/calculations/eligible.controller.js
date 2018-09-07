const models = require('../../../models');
const eligibleAccountsFilter = require('../../../logic/calculations/eligibleAccountsFilter');
const eligibleAccountsCalculationsLogic = require('../../../logic/calculations/eligibleAccountsCalculations');

const startEligibilityCalculation = (req, res) => {
  Promise.resolve()
    .then(() => eligibleAccountsCalculationsLogic.setData());

  res.status(200).json('Calculation started....');
};

const getEligibleAccounts = (req, res) => {
  const options = {};

  if (req.query.sortBy) {
    options.order = [[req.query.sortBy, req.query.sortOrder.toUpperCase()]];
  } else {
    options.order = [['totalScore', 'DESC']];
  }

  // agent/team lead filter
  if (req.query.agent) {
    options.where = {
      '"TradelinesStates"."agentId"': `'${req.query.agent}'`,
    };
  }

  if (req.query.team_lead) {
    options.where = {
      '"TradelinesStates"."teamLeadId"': `'${req.query.team_lead}'`,
    };
  }

  // pagination
  let page = parseInt(req.query.page || 1, 10);
  page -= 1; // base 0
  const pageSize = parseInt(req.query.page_size || 10, 10);
  options.offset = page;
  options.limit = pageSize;
  options.include = [{
    model: models.TradelinesState,
  }];

  eligibleAccountsFilter.getEligibleScorecardRecords(options).then(async (rows) => {
    // count the query rows (row count before pagination)
    let totalCount = 0;
    const rowsToCount = await eligibleAccountsFilter.getEligibleScorecardRecords();
    totalCount = rowsToCount.length;

    res.status(200).json({
      items: rows,
      page,
      page_size: pageSize,
      total_count: totalCount,
      page_count: Math.ceil(totalCount / pageSize),
    });
  });
};

module.exports = {
  startEligibilityCalculation,
  getEligibleAccounts,
};
