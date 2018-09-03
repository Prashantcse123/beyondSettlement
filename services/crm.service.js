const axios = require('axios');
const path = require('path');
const _ = require('lodash');
const redshift = require('./redshift.service');
const models = require('../models');
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
use: TODO change this
let tldata = await redshift.getTradelineName(['a0Q46000006JAiAEAW', 'a0Q46000006JAhqEAG', 'a0Q46000006JAeGEAW']);

let tldata = await redshift.getTradelineName(['a0Q46000006JAiAEAW', 'a0Q46000006JAhqEAG', 'a0Q46000006JAeGEAW']);
let tldata = await redshift.getTradelineId(['TL-00160409', 'TL-00160412', 'TL-00160416']);
 */

function idsToIn(ids, isString) {
  const wrap = isString ? '\'' : '';
  const wrappedIds = ids.map(id => `${wrap}${id}${wrap}`);
  return ['\'\'', ...wrappedIds].join(',');
}

function toTradelineId(tradeLineName) {
  return tradeLineName.replace(/TL\-(0?)+/, '');
}

function syncTradelineNameAttributes(tradeline) {
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
  return att;
}

async function pushTradelinesCrm(payload) {
  // get the data
  const url = getCrmUrl('trade-lines');
  console.log(`pushTradelinesCrm ${url}`);
  const { data } = await axios.patch(url, payload);
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
  return await pushTradelinesCrm(toSend);

  /*
  1. get data from sql
  2. get id's
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
};
