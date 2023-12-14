SELECT count(*)
from advancedAnalytic_sleepData_nightlySummary_OLD;

-- UPDATE advancedAnalytic_sleepData_nightlySummary_NEW_TEST SET date=DATE(createdAt);

SELECT subject_id, DATE(createdAt), count(*)
from advancedAnalytic_sleepData_nightlySummary
GROUP BY subject_id, DATE(createdAt)
HAVING count(*) > 1;

CREATE TABLE advancedAnalytic_sleepData_nightlySummary_NEW_NEW_TEST LIKE advancedAnalytic_sleepData_nightlySummary_NEW_TEST;
-- copy data to new table from old table
-- insert into advancedAnalytic_sleepData_nightlySummary_NEW_TEST select * from advancedAnalytic_sleepData_nightlySummary;

-- INSERT IGNORE INTO advancedAnalytic_sleepData_nightlySummary_NEW_NEW_TEST SELECT * FROM advancedAnalytic_sleepData_nightlySummary_NEW_TEST ORDER BY id desc;

-- RENAME TABLE advancedAnalytic_sleepData_nightlySummary TO advancedAnalytic_sleepData_nightlySummary_OLD, advancedAnalytic_sleepData_nightlySummary_NEW_NEW_TEST TO advancedAnalytic_sleepData_nightlySummary;

