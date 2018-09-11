const models = require('../models');
const crm = require('./crm.service');

/*
use:
  const data = await crm.syncTradelineNameToCrm(['TL-00037395', 'TL-00006075']);
  const data = await crm.syncTradelineNameFromCrm(['TL-00037395', 'TL-00006075']);

  [ { tradeLineName: 'TL-00037395',
    id: 3687,
    isDone: null,
    tradeLineId: 37395,
    createdAt: 2018-08-26T20:43:54.539Z,
    updatedAt: 2018-08-26T20:43:54.539Z,
    status: null,
    teamLeadId: null,
    agentId: null },
  { tradeLineName: 'TL-00006075',
    id: 13274,
    isDone: null,
    tradeLineId: 6075,
    createdAt: 2018-08-26T20:48:08.832Z,
    updatedAt: 2018-08-26T20:48:08.832Z,
    status: null,
    teamLeadId: null,
    agentId: null } ]

    [
    {
      "type": "trade_lines",
      "id": "a0Q46000006FP15",
      "attributes": {
        "submission_status": "pending_review",
        "review_status": "confirmed",
        "team_lead_id": "00546000001rswp",
        "agent_id": "00546000001sOF9"
      }
    },
    {
      "type": "trade_lines",
      "id": "a0Q46000006FMod",
      "attributes": {
        "submission_status": "pending_revIEw",
        "review_status": "None",
        "team_lead_id": "00546000001rswp"
      }
    }
  ]
   */

// get tradeline name by id
async function tradelineIdToName(tradelineId) {
  console.log('tradelineIdToName', tradelineId);
  const sql = `SELECT "public"."ScorecardRecords"."tradeLineName"
                  FROM "public"."TradelinesStates" 
                  INNER JOIN "public"."ScorecardRecords"
                      ON "public"."TradelinesStates"."tradeLineId" = "public"."ScorecardRecords"."tradeLineId"
                  where "TradelinesStates"."id" = ${tradelineId}
                  LIMIT 1;`;
  const tradeline = await models.sequelize.query(sql, { type: models.sequelize.QueryTypes.SELECT });

  return tradeline[0] ? tradeline[0].tradeLineName : null;
}


// sync a tradeline
module.exports.syncTradelineById = async function (tradelineId) {
  const tradelineName = await tradelineIdToName(tradelineId);
  crm.syncTradelineNameToCrm([tradelineName]);
};

