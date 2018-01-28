const models = require('../models');
const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  models.User.findAll({
    include: [models.Task],
  }).then((users) => {
    res.json({
      title: 'Sequelize: Express',
      users,
    });
  });
});

module.exports = router;
