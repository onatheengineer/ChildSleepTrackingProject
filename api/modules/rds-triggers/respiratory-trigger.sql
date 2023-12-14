DROP TRIGGER IF EXISTS totalAvgBpm_Trigger_on_Insert; -- drops the trigger from the db
DELIMITER ;;
CREATE TRIGGER totalAvgBpm_Trigger_on_Insert
    AFTER INSERT
    ON test_trigger_table
    FOR EACH ROW
BEGIN
    CALL mysql.lambda_async(
            'arn:aws:lambda:...:function:TestMySqlTrigger',
            CONCAT('{ "deviceId" : "', NEW.deviceId, '", "createdAt" : "', NEW.createdAt, '"}')
        );
END;
;;
DELIMITER ;

SHOW TRIGGERS
    IN PROJECT;


SELECT lambda_sync(
               'arn:aws:lambda:....:function:TestMySqlTrigger',
               '{"operation": "ping PING hey try"}');


INSERT into test_trigger_table (deviceId, createdAt)
VALUES ('4444444', NOW());

SELECT *
from test_trigger_table;

