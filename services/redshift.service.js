const Redshift = require('node-redshift');

const clientConfiguration = {
  user: process.env.REDSHIFT_USER,
  database: process.env.REDSHIFT_DATABASE,
  password: process.env.REDSHIFT_PASSWORD,
  port: process.env.REDSHIFT_PORT,
  host: process.env.REDSHIFT_HOST,
};

const redshift = new Redshift(clientConfiguration, { rawConnection: true });
const rawQuery = async sql => redshift.rawQuery(sql, { raw: true });
module.exports.rawQuery = rawQuery;

function idsToIn(ids, isString) {
  const wrap = isString ? '\'' : '';
  const wrappedIds = ids.map(id => `${wrap}${id}${wrap}`);

  return ['\'\'', ...wrappedIds].join(',');
}

function mapRecords(data, whatToMap, mapTo) {
  console.log('mapRecords', whatToMap, mapTo);
  const ret = {};
  data.forEach((record) => {
    ret[record[whatToMap]] = record[mapTo];
  });

  return ret;
}

/*
use:
let tldata = await redshift.getTradelineName(['a0Q46000006JAiAEAW', 'a0Q46000006JAhqEAG', 'a0Q46000006JAeGEAW']);
 */
module.exports.getTradelineName = async function (tradelineIds) {
  const ids = idsToIn(tradelineIds, true);
  const sql = `select id, name from datalake_sf.sf_nu_dse_tradeline_c_src 
    where id in (${ids})`;

  console.log('redshift sql', sql);
  const data = await rawQuery(sql);
  const ret = mapRecords(data, 'id', 'name');

  return ret;
};

/*
use:
let tldata = await redshift.getTradelineId(['TL-00160409', 'TL-00160412', 'TL-00160416']);
 */
module.exports.getTradelineId = async function (tradelineNames) {
  const ids = idsToIn(tradelineNames, true);
  const sql = `select id, name from datalake_sf.sf_nu_dse_tradeline_c_src 
    where name in (${ids})`;

  console.log('redshift sql', sql);
  const data = await rawQuery(sql);
  const ret = mapRecords(data, 'name', 'id');

  return ret;
};
