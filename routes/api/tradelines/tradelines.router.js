const joi = require('joi');
const controller = require('./tradelines.controller');

module.exports = [
  {
    method: 'patch',
    path: '/tradeline/:tradelineId',
    controller,
    validation: {
      body: {
        id: joi.number().integer().optional(),
        isDone: joi.boolean().allow(null).optional(),
        status: joi.number().integer().min(1).allow(null)
          .optional(),
        teamLeadId: joi.string().allow(null).optional(),
        agentId: joi.string().allow(null).optional(),
      },
    },
  },
];
