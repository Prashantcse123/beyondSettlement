const {
  getSourceData,
  testSourceData,
} = require('./source-data.controller');

module.exports = [
  {
    method: 'get',
    path: '/source/data/get',
    controller: getSourceData,
  },
  {
    method: 'get',
    path: '/source/data/test',
    controller: testSourceData,
  },
];
