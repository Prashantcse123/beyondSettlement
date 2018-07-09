const models = require('../../../models');
const express = require('express');
const scorecardCalculationsLogic = require('../../../logic/calculations/scorecardCalculations');

const router = express.Router();

router.get('/scorecard/set', (req, res) => {
  scorecardCalculationsLogic.setData().then((data) => {});
  res.status(200).json('Calculation started....');
});

router.get('/scorecard', (req, res) => {
    let options = {};

    if (req.query.sortBy) {
        options = {
            order: [[req.query.sortBy, req.query.sortOrder.toUpperCase()]]
        }
    }else{
        options = {
            order: [['id', 'ASC']]
        }
    }

    models.ScorecardRecord.findAll(options).then(rows => {
        let page = parseInt(req.query.page || 1);
        let pageSize = parseInt(req.query.page_size || 10);
        let start = pageSize * page - pageSize;
        let end = pageSize * page;
        let totalCount = rows.length;

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


router.put('/update_scorecard', (req, res) => {
    console.log(req.body);

    models.ScorecardRecord.findAll({where: {id: req.body.id}}).then(rows => {
        let row = rows[0];
        // console.log(row);
        row.update({isDone: req.body.isDone}).then(() => res.status(200).json('cool!'));
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

        if (row && row.value > 0 && row.value < 1 && row.value <= 99.99) {
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

// router.get('/test_account_column', (req, res) => {
//     let columnName = req.query.column;
//     let id = req.query.id;
//
//     accountCalculationsLogic.testColumn(columnName, id).then((result) =>
//         res.status(200).json({result: result}));
// });

module.exports = router;
