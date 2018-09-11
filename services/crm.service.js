const axios = require('axios');
const path = require('path');
const _ = require('lodash');
const redshift = require('./redshift.service');
const models = require('../models');
const config = require('../config/config');
const { CronJob } = require('cron');

// roles tree

// splits full name
function splitName(name) {
  const result = name.split(/\s+/);
  const firstName = result.slice(0, result.length - 1).join(' ');
  const lastName = result[result.length - 1];

  return { first_name: firstName, last_name: lastName };
}

function getCrmUrl(endpoint) {
  const url = path.join(process.env.CRM_URL, endpoint);

  return `http://${url}`;
}

async function pullRolesTreeData() {
  // get the data
  const url = getCrmUrl('users');
  console.log(`pullRolesTreeData from ${url}`);
  const { data } = await axios.get(url);

  return data.data;
}

function createUsers(ret, users) {
  users.forEach((user) => {
    // users
    const { id } = user;
    const { name, permissions } = user.attributes;
    // eslint-disable-next-line camelcase
    const { first_name, last_name } = splitName(name);

    ret.users[id] = {
      id, first_name, last_name, permissions,
    };

    // permissions
    permissions.forEach((permission) => {
      if (!ret.tree.roles[permission]) ret.tree.roles[permission] = [];
      ret.tree.roles[permission].push(id);
    });
  });
}

function createPermissions(ret, users) {
  users.forEach((user) => {
    // users
    const { id } = user;
    const { permissions } = user.attributes;

    // tree.teams
    if (permissions.indexOf('SETTLEMENTS_MANAGER') > -1) {
      ret.tree.teams_hash[id] = { team_lead: id, agents: [] };
    }
  });
}

function createTeams(ret, users) {
  // iterate again, because we need to make sure the manager is already there
  users.forEach((user) => {
    const managerId = user.attributes['beyond-manager-id'];

    if (managerId && ret.tree.teams_hash[managerId]) {
      ret.tree.teams_hash[managerId].agents.push(user.id);
    }
  });

  // team hash - show only teams that has agents
  ret.tree.teams_hash = _.pickBy(ret.tree.teams_hash, _team => _team.agents.length > 0);
  ret.tree.teams = _.values(ret.tree.teams_hash);
}

module.exports.pullRolesTree = async () => {
  console.log('pullRolesTree');
  // get the data
  const users = await pullRolesTreeData();

  // data structure to return
  const ret = {
    users: {},
    tree: {
      teams: [],
      teams_hash: {},
      roles: {},
    },
  };

  // slice and dice
  createUsers(ret, users);
  createPermissions(ret, users);
  createTeams(ret, users);

  return ret;
};

// sync from and to the crm

/*
use:
  const data = await crm.syncTradelineNameToCrm(['TL-00037395', 'TL-00006075']);
  const data = await crm.syncTradelineNameFromCrm(['TL-00037395', 'TL-00006075']);

  [ { tradeLineName: 'TL-00037395',
    id: 3687,
    isDone: null,
    tradeLineId: 37395,
    createdAt: 2018-08-26T20:43:54.539Z,
    updatedAt: 2018-08-26T20:43:54.539Z,
    status: null,
    teamLeadId: null,
    agentId: null },
  { tradeLineName: 'TL-00006075',
    id: 13274,
    isDone: null,
    tradeLineId: 6075,
    createdAt: 2018-08-26T20:48:08.832Z,
    updatedAt: 2018-08-26T20:48:08.832Z,
    status: null,
    teamLeadId: null,
    agentId: null } ]

    [
    {
      "type": "trade_lines",
      "id": "a0Q46000006FP15",
      "attributes": {
        "submission_status": "pending_review",
        "review_status": "confirmed",
        "team_lead_id": "00546000001rswp",
        "agent_id": "00546000001sOF9"
      }
    },
    {
      "type": "trade_lines",
      "id": "a0Q46000006FMod",
      "attributes": {
        "submission_status": "pending_revIEw",
        "review_status": "None",
        "team_lead_id": "00546000001rswp"
      }
    }
  ]
   */

function idsToIn(ids, isString) {
  const wrap = isString ? '\'' : '';
  const wrappedIds = ids.map(id => `${wrap}${id}${wrap}`);

  return ['\'\'', ...wrappedIds].join(',');
}

function toTradelineId(tradeLineName) {
  return tradeLineName.replace(/TL-(0?)+/, '');
}

// push tradelines to crm
function syncTradelineNameAttributes(tradeline) {
  console.log('syncTradelineNameAttributes', tradeline);
  /*
    status: null,
    teamLeadId: null,
    agentId: null
    =>
    'submission_status': 'pending_review',
    'review_status': 'confirmed',
    'team_lead_id': '00546000001rswp',
    'agent_id': '00546000001sOF'
 */
  // TODO add status attributes
  const att = {};
  att.team_lead_id = tradeline.teamLeadId || null;
  att.agent_id = tradeline.agentId || null;
  // pending review and confirm
  /*
    "review_status": "None",
    "submission_status": "pending_review",
    "review_status": "confirmed",
   */
  const { status } = tradeline;
  console.log('status', status);

  if (!status) {
    att.review_status = 'None';
    att.submission_status = 'None';
  } else if (status === 1) {
    att.submission_status = 'pending_review';
    att.review_status = 'None';
  } else if (status === 2) {
    att.submission_status = 'reviewed';
    att.review_status = 'confirmed';
  }
  att.agent_id = tradeline.agentId || null;
  att.agent_id = tradeline.agentId || null;

  return att;
}
async function pushTradelinesCrm(payload) {
  // get the data
  const url = getCrmUrl('trade-lines');
  console.log(`pushTradelinesCrm ${url}`);
  const { data } = await axios.patch(url, payload);
  console.log('url', url);
  console.log('payload', JSON.stringify(payload));

  return data.data;
}
module.exports.syncTradelineNameToCrm = async function (tradelineNames) {
  let toSend = [];
  // get the data
  const Ids = idsToIn(tradelineNames, true);
  const sql = `SELECT "public"."ScorecardRecords"."tradeLineName", "public"."TradelinesStates".*
              FROM "public"."TradelinesStates" 
              INNER JOIN "public"."ScorecardRecords" 
                  ON "public"."TradelinesStates"."tradeLineId" = "public"."ScorecardRecords"."tradeLineId"
              WHERE "ScorecardRecords"."tradeLineName" IN(${Ids})`;
  const tradelines = await models.sequelize.query(sql, { type: models.sequelize.QueryTypes.SELECT });
  const tradelineIds = await redshift.getTradelineId(tradelineNames);

  // build object
  tradelines.forEach((tradeline) => {
    const len = toSend.push({
      type: 'trade_lines',
      id: tradelineIds[tradeline.tradeLineName],
    });
    toSend[len - 1].attributes = syncTradelineNameAttributes(tradeline);
  });

  // sync
  toSend = { data: toSend };
  const ret = await pushTradelinesCrm(toSend);
  console.log('done pushTradelinesCrm');

  return ret;
};

// sync from salesforce
function sqlNullStr(str) {
  if (!str) return 'null';

  return `'${str}'`;
}
function buildTradelineSqlValue(tradeline, tradelineId) {
  const { attributes } = tradeline;
  // status
  let status = 'NULL::text';

  if (attributes['review-status'] === 'confirmed') status = 2;
  else if (attributes['submission-status'] === 'pending_review') status = 1;
  else status = 'NULL::int4';

  const sql = [
    tradelineId, status,
    sqlNullStr(attributes['team-lead-id']), sqlNullStr(attributes['agent-id']),
  ];

  return ['(', sql.join(','), ')'].join('');
}
// eslint-disable-next-line no-unused-vars
async function pullTradelinesCrm(tradelineIds) {
  // get the data
  let url = getCrmUrl('trade-lines');
  url = `${url}?filter[id]=${tradelineIds.join(',')}`;
  console.log('pullTradelinesCrm ', url);
  const { data } = await axios.get(url);

  return data.data;
}
async function pullTradelinesCrmBigArray(tradelineIds) {
  // get the data
  /*
  {
  "data": {
    "type": "trade-lines",
    "filter": {
      "id": "a0Q46000003nY86EAE,a0Q46000003nY86EAE,a0Q46000003nY86EAE"
    }
  }
   */
  const url = getCrmUrl('trade-lines/list');
  const payload = {
    data: {
      type: 'trade-lines',
      filter: {
        id: tradelineIds.join(','),
      },
    },
  };
  console.log('pullTradelinesCrmBigArray ', url);
  console.log('pullTradelinesCrm payload', JSON.stringify(payload));
  const { data } = await axios.post(url, payload);
  console.log('finished pulling trade-lines/list');

  return data.data;
}
module.exports.syncTradelineNameFromCrm = async function (tradelineNames) {
  console.log('syncTradelineNameFromCrm');
  // pull ids and create a hash
  // tradelineNames = tradelineNames.slice(1, 11); //for testing
  console.log('redshift.getTradelineId(tradelineNames)');
  const tradelineIds = await redshift.getTradelineId(tradelineNames);
  console.log('finish redshift');

  const tradelineMaps = _.invert(tradelineIds);
  // get tradelinds from salesforce
  const tradelines = await pullTradelinesCrmBigArray(_.values(tradelineIds));

  const tlSql = [];
  tradelines.forEach((tradeline) => {
    const tradelineId = toTradelineId(tradelineMaps[tradeline.id]);
    tlSql.push(buildTradelineSqlValue(tradeline, tradelineId));
  });
  // iterate and run sql
  const sqls = ['update "public"."TradelinesStates" as ts set',
    '"status" = c."status",',
    '"teamLeadId" = c."teamLeadId",',
    '"agentId" = c."agentId"',
    'from (values',
    tlSql.join(', '),
    ') as c(tradeLineId, "status", "teamLeadId", "agentId") ',
    'where c.tradeLineId = "ts"."tradeLineId";',
  ].join(' ');
  console.log('sqls', sqls);
  // todo: do we need a .spread() here?
  await models.sequelize.query(sqls).spread(() => {});

  return { status: 'ok' };
};

// sync all to crm - function and cron job
module.exports.syncAllFromCrm = async function () {
  console.log('syncAllFromCrm');
  // right now we are limiting to config.syncAllFromCrmRecordsLimit because of the trade-lines/list endpoint limit
  const result = await models.ScorecardRecord.findAll({ order: [['totalScore', 'DESC']], limit: config.syncAllFromCrmRecordsLimit });
  const tradelineNames = result.map(tradeline => tradeline.tradeLineName);
  await this.syncTradelineNameFromCrm(tradelineNames);
  console.log('syncAllFromCrm finished');
};
module.exports.startSyncAllFromCrmCron = function () {
  const func = this.syncAllFromCrm.bind(this);
  console.log(`start sync to crm cron job every ${config.syncAllFromCrmMinutesInterval} minutes`);
  // eslint-disable-next-line no-new
  new CronJob({
    cronTime: `0 */${config.syncAllFromCrmMinutesInterval} * * * *`,
    onTick: func,
    start: true,
  });
};
