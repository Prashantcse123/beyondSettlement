SELECT
  *,
  "TradelinesStates"."id" AS "TradelinesState.id",
"TradelinesStates"."isDone" AS "TradelinesState.isDone",
"TradelinesStates"."status" AS "TradelinesState.status",
"TradelinesStates"."teamLeadId" AS "TradelinesState.teamLeadId",
"TradelinesStates"."agentId" AS "TradelinesState.agentId",
"TradelinesStates"."tradeLineId" AS "TradelinesState.tradeLineId"
FROM "public"."ScorecardRecords" INNER JOIN "public"."TradelinesStates"
  ON "public"."TradelinesStates"."tradeLineId" = "public"."ScorecardRecords"."tradeLineId"
WHERE "public"."ScorecardRecords"."id" IN (SELECT
  "public"."ScorecardRecords"."id"
FROM (SELECT
  "programName",
  MIN("concatenatedIndex") AS "maxScore"
FROM "public"."ScorecardRecords"
GROUP BY "programName") AS "maxScores"
INNER JOIN "public"."ScorecardRecords"
  ON "public"."ScorecardRecords"."programName" = "maxScores"."programName"
  AND "public"."ScorecardRecords"."concatenatedIndex" = "maxScores"."maxScore"
WHERE "public"."ScorecardRecords"."eligibility" = 'eligible')
