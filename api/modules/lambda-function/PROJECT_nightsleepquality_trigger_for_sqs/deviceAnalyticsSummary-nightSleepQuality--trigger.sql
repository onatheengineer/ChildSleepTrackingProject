DROP TRIGGER IF EXISTS PROJECT_deviceAnalyticsSummary_nightSleepQuality_TRIGGER; -- drops the trigger from the db
DELIMITER ;;
CREATE TRIGGER PROJECT_deviceAnalyticsSummary_nightSleepQuality_TRIGGER
    AFTER INSERT
    ON PROJECT.deviceAnalyticsSummary
    FOR EACH ROW
BEGIN
    CALL mysql.lambda_async(
            'arn:aws:lambda:....:function:PROJECT_nightsleepquality_trigger_for_sqs',
            CONCAT('{ "deviceId" : "', NEW.deviceId, '", "date" : "', NEW.date, '", "action": "insert"}')
        );
END;
;;
DELIMITER ;

SHOW TRIGGERS
    IN PROJECT;


-- SELECT lambda_sync(
--                'arn:aws:lambda:....:function:PROJECT_subject_manage_refactor',
--                '{"operation": "ping PING hey trying this ping."}');
