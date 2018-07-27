DELETE FROM "public"."ScorecardRecords"
    WHERE "public"."ScorecardRecords"."id" NOT IN (
        SELECT "public"."ScorecardRecords"."id"
            FROM (SELECT "programName", MAX("totalScore") AS "maxScore"
                FROM "public"."ScorecardRecords"
                GROUP BY "programName") AS "maxScores"
            INNER JOIN "public"."ScorecardRecords"
                ON "public"."ScorecardRecords"."programName" = "maxScores"."programName"
                    AND "public"."ScorecardRecords"."totalScore" = "maxScores"."maxScore"
            WHERE "public"."ScorecardRecords"."eligibility" = 'eligible'
    );

-- In case you'd like to debug the delete logic: will delete everything that isn't returned in the following query
-- SELECT "maxScores".*, "public"."ScorecardRecords"."eligibility", "public"."ScorecardRecords"."id"
--     FROM (SELECT "programName", MAX("totalScore") AS "maxScore"
--         FROM "public"."ScorecardRecords"
--         GROUP BY "programName") AS "maxScores"
--     INNER JOIN "public"."ScorecardRecords"
--         ON "public"."ScorecardRecords"."programName" = "maxScores"."programName"
--             AND "public"."ScorecardRecords"."totalScore" = "maxScores"."maxScore"
--     WHERE "public"."ScorecardRecords"."eligibility" = 'eligible'

