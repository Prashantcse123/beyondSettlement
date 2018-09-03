const models = require('../../models/index');
const _ = require('lodash');

const eligibleAccountsFilter = {
  getEligibleScorecardRecords: (options = {}) => {
    let sql = require('./sql/eligibleAccountsFilter.sql');

    if (options.order) {
      const orderArr = [];
      let orderStr = 'ORDER BY ';

      options.order.forEach(o => orderArr.push(`"${o[0]}" ${o[1]}`));

      orderStr += orderArr.join(',');
      sql += orderStr;
    }

    return new Promise(resolve =>
      models.sequelize.query(sql) // run sql
        .spread((results) => {
          // transform join fields with dot (like 'TradelinesState.agentId') to
          // nested Object (like { TradelinesState: { agentId }})
          const joinKeys = results[0] ? Object.keys(results[0]).filter(key => key.includes('.')) : [];
          return resolve(results.map((row) => {
            const result = _.omit(row, joinKeys);
            joinKeys.forEach(key => _.set(result, key, row[key]));
            return result;
          }));
        }));
  },
};

module.exports = eligibleAccountsFilter;
