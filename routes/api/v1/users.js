const models = require('../../../models');
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

router.post('/', (req, res) => {
  models.User.create({
    username: req.body.username,
  }).then((user) => {
    res.status(201).json(user);
  });
});

router.delete('/:userId', (req, res) => {
  models.User.destroy({
    where: {
      id: req.params.userId,
    },
  }).then(() => {
    res.status(204).json();
  });
});

router.post('/:userId/tasks', (req, res) => {
  models.Task.create({
    title: req.body.title,
    UserId: req.params.userId,
  }).then((task) => {
    res.status(201).json(task);
  });
});

router.delete('/:userId/tasks/:taskId', (req, res) => {
  models.Task.destroy({
    where: {
      id: req.params.taskId,
    },
  }).then(() => {
    res.status(204).json();
  });
});

module.exports = router;
