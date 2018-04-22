const models = require('../../../models');
const express = require('express');
const creditorCalculationsLogic = require('../../../logic/calculations/creditorCalculations');
const accountCalculationsLogic = require('../../../logic/calculations/accountCalculations');
const scorecardCalculationsLogic = require('../../../logic/calculations/scorecardCalculations');

const router = express.Router();

router.get('/creditor/set', (req, res) => {
  creditorCalculationsLogic.setData().then((data) => {});
  res.status(200).json(data);
});

router.get('/account/set', (req, res) => {
  accountCalculationsLogic.setData().then((data) => {});
  res.status(200).json(data);
});

router.get('/scorecard/set', (req, res) => {
  scorecardCalculationsLogic.setData().then((data) => {});
  res.status(200).json(data);
});

router.get('/all/set', (req, res) => {
  Promise.resolve()
    .then(() => creditorCalculationsLogic.setData())
    .then(() => accountCalculationsLogic.setData())
    .then(() => scorecardCalculationsLogic.setData());

  res.status(200).json('Success!');
});

router.get('/scorecard', (req, res) => {
    models.Scorecard.findAll().then(rows => {
        let page = parseInt(req.query.page || 1);
        let pageSize = parseInt(req.query.page_size || 10);
        let start = pageSize * page - pageSize;
        let end = pageSize * page;
        let totalCount = rows.length;

        // rows = rows.filter(r => JSON.stringify(r).includes(req.query.filter));
        rows = rows.slice(start, end);

        res.status(200).json({
            items: rows,
            page: page,
            page_size: pageSize,
            total_count: totalCount,
            page_count: Math.ceil(totalCount / pageSize)
        });
    });
});


router.get('/progress', (req, res) => {
  let type = 'Progress';

  models.Progress.findAll({where: {type}}).then(rows => {
    let row = rows[0];

    if (row) {
      res.status(200).json(row);
    }else{
      res.status(200).json(0);
    }
  });
});

router.get('/status', (req, res) => {
    let type = 'Progress';

    models.Progress.findAll({where: {type}}).then(rows => {
        let row = rows[0];

        if (row && row.value > 0 && row.value < 1) {
            res.status(200).json({
                // abortable: true,
                busy: true,
                progress: row.value,
                task: row.task
            });
        }else{
            res.status(200).json({busy: false});
        }
    });
});

router.get('/test', (req, res) => {
  res.status(200).json('Test Success! :)');
});

module.exports = router;
