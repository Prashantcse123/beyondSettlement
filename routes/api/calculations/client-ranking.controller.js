const models = require('../../../models');

module.exports = (req, res) => {
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
