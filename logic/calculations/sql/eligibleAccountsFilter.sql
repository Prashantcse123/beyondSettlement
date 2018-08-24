SELECT
  *
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

 --ORDER BY Country DESC, City ASC

--DELETE FROM "public"."ScorecardRecords"
--    WHERE "public"."ScorecardRecords"."id" NOT IN (
--        SELECT "public"."ScorecardRecords"."id"
--            FROM (SELECT "programName", MAX("totalScore") AS "maxScore"
--                FROM "public"."ScorecardRecords"
--                GROUP BY "programName") AS "maxScores"
--            INNER JOIN "public"."ScorecardRecords"
--                ON "public"."ScorecardRecords"."programName" = "maxScores"."programName"
--                    AND "public"."ScorecardRecords"."totalScore" = "maxScores"."maxScore"
--            WHERE "public"."ScorecardRecords"."eligibility" = 'eligible'
--    );

-- In case you'd like to debug the delete logic: will delete everything that isn't returned in the following query
-- SELECT "maxScores".*, "public"."ScorecardRecords"."eligibility", "public"."ScorecardRecords"."id"
--     FROM (SELECT "programName", MAX("totalScore") AS "maxScore"
--         FROM "public"."ScorecardRecords"
--         GROUP BY "programName") AS "maxScores"
--     INNER JOIN "public"."ScorecardRecords"
--         ON "public"."ScorecardRecords"."programName" = "maxScores"."programName"
--             AND "public"."ScorecardRecords"."totalScore" = "maxScores"."maxScore"
--     WHERE "public"."ScorecardRecords"."eligibility" = 'eligible'

