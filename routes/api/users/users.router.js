const controller = require('./users.controller');

module.exports = [
  {
    method: 'get',
    path: '/me',
    controller,
  },
];
