const joi = require('joi');
const {
  login,
  oauthAuthenticate,
  oauthRefresh,
  oauthCallback,
  getOauthUserInfo,
} = require('./auth.controller');

module.exports = [
  {
    method: 'post',
    path: '/login',
    controller: login,
    validation: {
      body: {
        username: joi.string().required(),
        password: joi.string().required(),
      },
    },
  },
  {
    method: 'get',
    path: '/oauth/authenticate',
    controller: oauthAuthenticate,
    validation: {},
  },
  {
    method: 'get',
    path: '/oauth/refresh',
    controller: oauthRefresh,
    validation: {},
  },
  {
    method: 'get',
    path: '/oauth/callback',
    controller: oauthCallback,
    validation: {},
  },
  {
    method: 'get',
    path: '/oauth/user_info',
    controller: getOauthUserInfo,
    validation: {},
  },
];
