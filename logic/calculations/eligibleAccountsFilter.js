const models = require('../../models/index');

const eligibleAccountsFilter = {
  getEligibleScorecardRecords: (options) => {
    let sql = require('./sql/eligibleAccountsFilter.sql');

    options = options || {};
    if (options.order) {
      const orderArr = [];
      let orderStr = 'ORDER BY ';

      options.order.forEach(o =>
        orderArr.push(`"${o[0]}" ${o[1]}`));

      orderStr += orderArr.join(',');
      sql += orderStr;
    }

    return new Promise((resolve, reject) =>
      models.sequelize.query(sql) // run sql
        .spread((results, metadata) => resolve(results)));
  },
};

module.exports = eligibleAccountsFilter;
