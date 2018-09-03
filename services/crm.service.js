const axios = require('axios');
const path = require('path');
const _ = require('lodash');
const redshift = require('./redshift.service');

// roles tree

// splits full name
function splitName(name) {
  const result = name.split(/\s+/);
  const firstName = result.slice(0, result.length - 1).join(' ');
  const lastName = result[result.length - 1];
  return { first_name: firstName, last_name: lastName };
}

async function pullRolesTreeData() {
  // get the data
  let url = path.join(process.env.CRM_URL, 'users');
  url = `http://${url}`;
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
