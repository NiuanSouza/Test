DELIMITER $$

DROP TRIGGER IF EXISTS trg_validate_car_availability$$
CREATE TRIGGER trg_validate_car_availability
BEFORE INSERT ON attendance
FOR EACH ROW
BEGIN
    DECLARE current_status VARCHAR(20);
    SELECT vehicle_status INTO current_status FROM cars WHERE prefix = NEW.car_prefix;
    
    IF current_status != 'AVAILABLE' THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Error: This vehicle is not available for use at the moment.';
    END IF;
END$$

DROP TRIGGER IF EXISTS trg_update_km_and_oil$$
CREATE TRIGGER trg_update_km_and_oil
AFTER INSERT ON records
FOR EACH ROW
BEGIN
    DECLARE v_oil_km FLOAT;
    DECLARE v_car_prefix VARCHAR(20);
    DECLARE v_current_obs TEXT;
    
    SELECT car_prefix INTO v_car_prefix FROM attendance WHERE id = NEW.service_id;
    
    SELECT next_oil_change_km, observations INTO v_oil_km, v_current_obs FROM cars WHERE prefix = v_car_prefix;
    
    UPDATE cars SET current_km = NEW.record_km WHERE prefix = v_car_prefix;
    
    IF NEW.record_km >= v_oil_km THEN
        IF v_current_obs IS NULL OR v_current_obs NOT LIKE '%ALERT: Oil change required.%' THEN
            UPDATE cars 
            SET vehicle_status = 'MAINTENANCE',
                observations = CONCAT(IFNULL(v_current_obs, ''), ' - ALERT: Oil change required.')
            WHERE prefix = v_car_prefix;
        ELSE 
            UPDATE cars SET vehicle_status = 'MAINTENANCE' WHERE prefix = v_car_prefix;
        END IF;
    END IF;
END$$

DROP TRIGGER IF EXISTS trg_start_service_status$$
CREATE TRIGGER trg_start_service_status
AFTER INSERT ON attendance
FOR EACH ROW
BEGIN
    UPDATE cars SET vehicle_status = 'IN_USE' WHERE prefix = NEW.car_prefix;
END$$

DROP TRIGGER IF EXISTS trg_clear_use_after_cancellation$$
CREATE TRIGGER trg_clear_use_after_cancellation
AFTER INSERT ON incidents
FOR EACH ROW
BEGIN
    DECLARE v_car_prefix VARCHAR(20);

    IF NEW.incident_type = 'CANCELLATION' THEN
        SELECT car_prefix INTO v_car_prefix FROM attendance WHERE id = NEW.service_id;
        
        UPDATE cars SET vehicle_status = 'AVAILABLE' WHERE prefix = v_car_prefix;
        
        UPDATE attendance SET completion_time = CURRENT_TIMESTAMP WHERE id = NEW.service_id AND completion_time IS NULL;
    END IF;
END$$

DELIMITER ;
