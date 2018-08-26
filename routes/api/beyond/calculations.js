    const models = require('../../../models');
const express = require('express');
// const creditorCalculationsLogic = require('../../../logic/calculations/old/creditorCalculations');
// const accountCalculationsLogic = require('../../../logic/calculations/old/accountCalculations');
const scorecardCalculationsLogic = require('../../../logic/calculations/scorecardCalculations');
const eligibleAccountsCalculationsLogic = require('../../../logic/calculations/eligibleAccountsCalculations');
const eligibleAccountsFilter = require('../../../logic/calculations/eligibleAccountsFilter');

const router = express.Router();

router.get('/scorecard/set', (req, res) => {
    Promise.resolve()
        .then(() => scorecardCalculationsLogic.setData())
        .then(() => eligibleAccountsCalculationsLogic.setData());

    res.status(200).json('Calculation started....');
});

router.get('/eligibility/set', (req, res) => {
    Promise.resolve()
        .then(() => eligibleAccountsCalculationsLogic.setData());

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
            order: [['totalScore', 'DESC']]
        }
    }

    //pagination
    let page = parseInt(req.query.page || 1);
    page--; // base 0
    let pageSize = parseInt(req.query.page_size || 10);
    options['offset'] = page;
    options['limit'] = pageSize;

    models.ScorecardRecord.findAndCountAll(options).then(result => {
        let totalCount = result.count; //number of rows in the table
        res.status(200).json({
            items: result.rows,
            page: page,
            page_size: pageSize,
            total_count: totalCount,
            page_count: Math.ceil(totalCount / pageSize)
        });
    });
});

router.get('/scorecard_eligible', (req, res) => {
    let options = {};

    if (req.query.sortBy) {
        options = {
            order: [[req.query.sortBy, req.query.sortOrder.toUpperCase()]]
        }
    }else{
        options = {
            order: [['totalScore', 'DESC']]
        }
    }

    //pagination
    let page = parseInt(req.query.page || 1);
    page--; // base 0
    let pageSize = parseInt(req.query.page_size || 10);
    options['offset'] = page;
    options['limit'] = pageSize;

    eligibleAccountsFilter.getEligibleScorecardRecords(options).then(async rows => {

        //count the query rows (row count before pagination)
        let totalCount = 0;
        let rowsToCount = await eligibleAccountsFilter.getEligibleScorecardRecords();
        totalCount = rowsToCount.length;

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

  models.TradelinesState.findOne({ where: { tradeLineId: req.body.tradeLineId } }).then((row) => {
    console.log(row);
    row.update({ isDone: req.body.isDone }).then(() => res.status(200).json('cool!'));
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

    models.Progress.findAll({ where: { type }, order: [
        ['value', 'DESC']
    ]}).then(rows => {
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

module.exports = router;
