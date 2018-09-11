const models = require('../../../models');

module.exports.responseHandler = (rows, page, pageSize, totalCount) => {
  const response = {
    items: rows,
    page,
    page_size: pageSize,
    total_count: totalCount,
    page_count: Math.ceil(totalCount / pageSize),
  };

  return response;
};

module.exports.completeData = (req) => {
  const completeOptions = {};
  completeOptions.order = [];
  completeOptions.where = {};

  if (req.query.sortBy) {
    completeOptions.order = [
      [req.query.sortBy, req.query.sortOrder.toUpperCase()],
    ];
  } else {
    completeOptions.order = [
      ['totalScore', 'DESC'],
    ];
  }

  if (req.query.agent) {
    completeOptions.where = {
      '"TradelinesStates"."agentId"': `'${req.query.agent}'`,
    };
  }

  if (req.query.team_lead) {
    completeOptions.where = {
      '"TradelinesStates"."teamLeadId"': `'${req.query.team_lead}'`,
    };
  }
  completeOptions.page = parseInt(req.query.page || 1, 10);
  completeOptions.page -= 1; // base 0
  completeOptions.pageSize = parseInt(req.query.page_size || 10, 10);
  completeOptions.offset = completeOptions.page;
  completeOptions.limit = completeOptions.pageSize;
  completeOptions.include = [{
    model: models.TradelinesState,
  }];

  return completeOptions;
};
