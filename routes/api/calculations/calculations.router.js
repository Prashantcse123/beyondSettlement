const joi = require('joi');
const statusController = require('./status.controller');
const progressController = require('./progress.controller');
const {
  startEligibilityCalculation,
  getEligibleAccounts,
} = require('./eligible.controller');
const clientRankingController = require('./client-ranking.controller');
const {
  getScorecards,
  updateScorecard,
  startScorecardCalculation,
} = require('./scorecard.controller');

const scorecardQueryRules = {
  sortBy: joi.string(),
  sortOrder: joi.string(),
  agent: joi.string(),
  team_lead: joi.string(),
  page: joi.number().integer(),
  page_size: joi.number().integer(),
};

module.exports = [
  {
    method: 'get',
    path: '/calculations/scorecard/set',
    controller: startScorecardCalculation,
  },
  {
    method: 'get',
    path: '/calculations/eligibility/set',
    controller: startEligibilityCalculation,
  },
  {
    method: 'get',
    path: '/calculations/scorecard',
    controller: getScorecards,
    validation: {
      query: scorecardQueryRules,
    },
  },
  {
    method: 'get',
    path: '/calculations/client_ranking',
    controller: clientRankingController,
    validation: {
      query: scorecardQueryRules,
    },
  },
  {
    method: 'get',
    path: '/calculations/scorecard_eligible',
    controller: getEligibleAccounts,
    validation: {
      query: scorecardQueryRules,
    },
  },
  {
    method: 'put',
    path: '/calculations/update_scorecard',
    controller: updateScorecard,
    validation: {},
  },
  {
    method: 'get',
    path: '/calculations/progress',
    controller: progressController,
  },
  {
    method: 'get',
    path: '/calculations/status',
    controller: statusController,
  },
];
