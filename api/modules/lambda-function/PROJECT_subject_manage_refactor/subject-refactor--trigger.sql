DROP TRIGGER IF EXISTS PROJECT_subject_manage_refactor_on_DELETE_TRIGGER; -- drops the trigger from the db
DELIMITER ;;
CREATE TRIGGER PROJECT_subject_manage_refactor_on_DELETE_TRIGGER
    BEFORE DELETE
    ON PROJECT.device
    FOR EACH ROW
BEGIN
    CALL mysql.lambda_async(
            'arn:aws:lambda:...:function:PROJECT_subject_manage_refactor',
            CONCAT('{ "deviceId" : "', OLD.deviceId, '", "action": "delete"}')
        );

END;
;;
DELIMITER ;

-- SHOW TRIGGERS
--  IN PROJECT;


-- SELECT lambda_sync(
--                'arn:aws:lambda:....:function:PROJECT_subject_manage_refactor',
--                '{"operation": "ping PING hey trying this ping."}');
