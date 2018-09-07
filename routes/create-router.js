const glob = require('glob');
const joi = require('joi');
const express = require('express');
const { isEmpty } = require('lodash');

function concat(result, value) {
  return result.concat(value);
}

function validateMiddleware(validation) {
  return (req, res, next) => {
    if (!validation || isEmpty(validation)) {
      return next();
    }

    const reqProps = Object.keys(validation);
    const errors = [];
    reqProps.forEach((reqProp) => {
      const { value, error } = joi.validate(req[reqProp], validation[reqProp], {
        abortEarly: false, // find all errors
        allowUnknown: true,
      });

      if (error) {
        errors.push(...error.details.map(err => Object.assign(err, { location: reqProp })));
      } else {
        req[reqProp] = value;
      }
    });

    if (!isEmpty(errors)) {
      return next(errors);
    }

    return next();
  };
}

function getRoutes(patterns) {
  const options = {
    realpath: true,
    cwd: process.cwd(),
  };

  return patterns
    .map(pattern => glob.sync(pattern, options))
    .reduce(concat, [])
    .map(require)
    .reduce(concat, []);
}

module.exports = (patterns) => {
  const routeObjects = getRoutes(patterns);

  const router = express.Router();

  routeObjects.forEach((route) => {
    const {
      method,
      path,
      controller,
      validation,
    } = route;

    router[method](path, validateMiddleware(validation), controller);
  });

  return router;
};
