const models = require('../../../models');
const Helper = require('./Helper');

module.exports = (req, res) => {
  let order = [];
  let where = {
    eligibility: 'eligible',
  };
  const completeOptions = Helper.completeData(req);
  [order, where] = [completeOptions.order, completeOptions.where];
  const options = {
    where,
    order,
    offset: completeOptions.offset,
    limit: completeOptions.limit,
    include: completeOptions.include,
  };
  models.ScorecardRecord.findAndCountAll(options).then((result) => {
    const totalCount = result.count; // number of rows in the table
    const response = Helper.responseHandler(result.rows, completeOptions.page, completeOptions.pageSize, totalCount);
    res.status(200).json(response);
  });
};
