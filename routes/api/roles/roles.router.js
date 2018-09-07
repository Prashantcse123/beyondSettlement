const {
  getRolesTree,
  syncFromCrm,
} = require('./roles.controller');

module.exports = [
  {
    method: 'get',
    path: '/roles_tree',
    controller: getRolesTree,
  },
  {
    method: 'get',
    path: '/sync_from_crm',
    controller: syncFromCrm,
  },
];
