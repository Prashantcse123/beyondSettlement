const models = require('../../../models');
const express = require('express');
const _ = require('lodash');

const router = express.Router();

router.patch('/tradeline/:tradelineId', (req, res) => {
  const data = Object.assign({}, _.omit(req.body, ['id']), {
    updatedAt: new Date(),
  });
  const { tradelineId } = req.params;

  models.TradelinesState.update(data, {
    where: {
      id: tradelineId,
    },
  }).then(result => res.status(200).json(result)).catch((error) => {
    console.error('ERROR: could not update tradeline ', error);
    return res.status(500).json({ message: 'Could not update tradeline' });
  });
});

module.exports = router;
