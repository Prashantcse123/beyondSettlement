const _ = require('lodash');
const models = require('../../../models');
const scorecardCalculationsLogic = require('../../../logic/calculations/scorecardCalculations');
const eligibleAccountsCalculationsLogic = require('../../../logic/calculations/eligibleAccountsCalculations');

const startScorecardCalculation = (req, res) => {
  Promise.resolve()
    .then(() => scorecardCalculationsLogic.setData())
    .then(() => eligibleAccountsCalculationsLogic.setData());

  res.status(200).json('Calculation started....');
};

const updateScorecard = (req, res) => {
  models.TradelinesState.findOne({
    where: {
      tradeLineId: req.body.tradeLineId,
    },
  }).then((row) => {
    const data = _.omit(req.body, ['id', 'tradeLineId']);
    row.update(data).then(() => res.status(200).json('Tradeline updated'));
  });
};

const getScorecards = (req, res) => {
  const options = {};

  if (req.query.sortBy) {
    options.order = [[req.query.sortBy, req.query.sortOrder.toUpperCase()]];
  } else {
    options.order = [['totalScore', 'DESC']];
  }

  // agent/team lead filter
  if (req.query.agent) {
    options.where = {
      '$TradelinesState.agentId$': req.query.agent,
    };
  }

  if (req.query.team_lead) {
    options.where = {
      '$TradelinesState.teamLeadId$': req.query.team_lead,
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

  models.ScorecardRecord.findAndCountAll(options).then((result) => {
    const totalCount = result.count; // number of rows in the table
    res.status(200).json({
      items: result.rows,
      page,
      page_size: pageSize,
      total_count: totalCount,
      page_count: Math.ceil(totalCount / pageSize),
    });
  });
};

module.exports = {
  updateScorecard,
  getScorecards,
  startScorecardCalculation,
};
