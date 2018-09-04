const models = require('../../../models');
const express = require('express');
// const creditorCalculationsLogic = require('../../../logic/calculations/old/creditorCalculations');
// const accountCalculationsLogic = require('../../../logic/calculations/old/accountCalculations');
const scorecardCalculationsLogic = require('../../../logic/calculations/scorecardCalculations');
const eligibleAccountsCalculationsLogic = require('../../../logic/calculations/eligibleAccountsCalculations');
const eligibleAccountsFilter = require('../../../logic/calculations/eligibleAccountsFilter');
const _ = require('lodash');
const crm = require('../../../services/crm.service');

const router = express.Router();

router.get('/scorecard/set', (req, res) => {
  Promise.resolve()
    .then(() => scorecardCalculationsLogic.setData())
    .then(() => eligibleAccountsCalculationsLogic.setData());

  res.status(200).json('Calculation started....');
});

router.get('/eligibility/set', (req, res) => {
  Promise.resolve()
    .then(() => eligibleAccountsCalculationsLogic.setData());

  res.status(200).json('Calculation started....');
});

router.get('/scorecard', (req, res) => {
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
  let page = parseInt(req.query.page || 1);
  page--; // base 0
  const pageSize = parseInt(req.query.page_size || 10);
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
});

router.get('/client_ranking', (req, res) => {
  let order = [];
  const where = { eligibility: 'eligible' };
  // agent/team lead filter
  if (req.query.agent) {
    where['$TradelinesState.agentId$'] = req.query.agent;
  }
  if (req.query.team_lead) {
    where['$TradelinesState.teamLeadId$'] = req.query.team_lead;
  }
  if (req.query.sortBy) {
    order = [[req.query.sortBy, req.query.sortOrder.toUpperCase()]];
  } else {
    order = [['totalScore', 'DESC']];
  }
  const options = { where, order };

  // pagination
  let page = parseInt(req.query.page || 1);
  page--; // base 0
  const pageSize = parseInt(req.query.page_size || 10);
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
});

router.get('/scorecard_eligible', (req, res) => {
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
  let page = parseInt(req.query.page || 1);
  page--; // base 0
  const pageSize = parseInt(req.query.page_size || 10);
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
});

router.put('/update_scorecard', (req, res) => {
  models.TradelinesState.findOne({
    where: {
      tradeLineId: req.body.tradeLineId,
    },
  }).then((row) => {
    const data = _.omit(req.body, ['id', 'tradeLineId']);
    row.update(data).then(() => res.status(200).json('Tradeline updated'));
  });
});

router.get('/progress', (req, res) => {
  const type = 'Progress';

  models.Progress.findAll({ where: { type } }).then((rows) => {
    const row = rows[0];

    if (row) {
      res.status(200).json(row);
    } else {
      res.status(200).json(0);
    }
  });
});

router.get('/status', (req, res) => {
  const type = 'Progress';

  models.Progress.findAll({
    where: { type },
    order: [
      ['value', 'DESC'],
    ],
  }).then((rows) => {
    const row = rows[0];

    if (row && row.value > 0 && row.value < 1 && row.value <= 99.99) {
      res.status(200).json({
        // abortable: true,
        busy: true,
        progress: row.value,
        task: row.task,
      });
    } else {
      res.status(200).json({ busy: false });
    }
  });
});

router.get('/test', (req, res) => {
  res.status(200).json('Test Success! :)');
});

module.exports = router;
