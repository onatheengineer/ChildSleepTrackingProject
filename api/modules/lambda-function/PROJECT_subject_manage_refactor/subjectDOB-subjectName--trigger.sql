DROP TRIGGER IF EXISTS PROJECT_subject_manage_DOB_and_NAME_on_UPDATE_TRIGGER; -- drops the trigger from the db
DELIMITER ;;
CREATE TRIGGER PROJECT_subject_manage_DOB_and_NAME_on_UPDATE_TRIGGER
    AFTER UPDATE
    ON PROJECT.device
    FOR EACH ROW
BEGIN
    CALL mysql.lambda_async(
            'arn:aws:lambda:....:function:PROJECT_subject_manage_refactor',
            CONCAT('{ "deviceId" : "', NEW.deviceId, '", "action": "update"}')
        );
END;
;;
DELIMITER ;

-- SHOW TRIGGERS
--  IN PROJECT;


-- SELECT lambda_sync(
--                'arn:aws:lambda:....:function:PROJECT_subject_manage_refactor',
--                '{"operation": "ping PING hey trying this ping."}');