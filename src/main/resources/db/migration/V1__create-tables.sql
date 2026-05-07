SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS incidents_aud;
DROP TABLE IF EXISTS refuelings_aud;
DROP TABLE IF EXISTS records_aud;
DROP TABLE IF EXISTS service_aud;
DROP TABLE IF EXISTS cars_aud;
DROP TABLE IF EXISTS users_aud;
DROP TABLE IF EXISTS car_type_aud;
DROP TABLE IF EXISTS revinfo;

DROP TABLE IF EXISTS incidents;
DROP TABLE IF EXISTS refuelings;
DROP TABLE IF EXISTS records;
DROP TABLE IF EXISTS service;
DROP TABLE IF EXISTS cars;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS car_type;

SET FOREIGN_KEY_CHECKS = 1;

-- =========================================================================
-- 1. TABELAS PRINCIPAIS
-- =========================================================================
CREATE TABLE car_type (
    id INT AUTO_INCREMENT PRIMARY KEY,
    brand VARCHAR(100),
    model VARCHAR(100),
    year INT,
    category ENUM('PASSENGER', 'UTILITY'),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM'
);

CREATE TABLE users (
    registration VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    permission VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    gender VARCHAR(20),
    birth_date DATE,
    driver_license VARCHAR(20),
    driver_license_category VARCHAR(5),
    driver_license_expiration DATE,
    employee_status ENUM('AVAILABLE', 'ON_DUTY', 'DISMISSED') DEFAULT 'AVAILABLE',
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM'
);

CREATE TABLE cars (
    prefix VARCHAR(20) PRIMARY KEY,
    license_plate VARCHAR(10),
    type_id INT,
    fuel VARCHAR(20),
    current_km FLOAT,
    next_oil_change_km FLOAT,
    tank_capacity FLOAT,
    renavam VARCHAR(11) UNIQUE,
    chassi VARCHAR(17) UNIQUE,
    available BOOLEAN,
    color VARCHAR(30),
    required_license VARCHAR(20),
    vehicle_status ENUM('AVAILABLE', 'IN_USE', 'MAINTENANCE', 'UNAVAILABLE') DEFAULT 'AVAILABLE',
    observations TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    CONSTRAINT fk_car_type FOREIGN KEY (type_id) REFERENCES car_type(id)
);

CREATE TABLE service (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    car_prefix VARCHAR(20),
    user_registration VARCHAR(50),
    departure_time DATETIME,
    arrival_time DATETIME,
    completion_time DATETIME,
    expected_completion_time DATETIME,
    departure_km FLOAT,
    arrival_km FLOAT,
    destination_requester VARCHAR(255),
    description TEXT,
    priority ENUM('LOW', 'MEDIUM', 'HIGH', 'SCHEDULED') DEFAULT 'MEDIUM',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    CONSTRAINT fk_service_car FOREIGN KEY (car_prefix) REFERENCES cars(prefix),
    CONSTRAINT fk_service_user FOREIGN KEY (user_registration) REFERENCES users(registration)
);

CREATE TABLE records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    service_id BIGINT,
    record_type ENUM('CHECK_IN', 'CHECK_OUT', 'REFUELING', 'INCIDENT'),
    record_date DATETIME,
    record_km FLOAT,
    note VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    CONSTRAINT fk_record_service FOREIGN KEY (service_id) REFERENCES service(id)
);

CREATE TABLE refuelings (
    record_id BIGINT PRIMARY KEY,
    liters FLOAT,
    price_per_liter DOUBLE,
    total_amount DOUBLE,
    fuel_type ENUM('GASOLINE', 'ETHANOL', 'DIESEL', 'GNV'),
    gas_station_name VARCHAR(100),
    invoice VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    CONSTRAINT fk_refueling_record FOREIGN KEY (record_id) REFERENCES records(id) ON DELETE CASCADE
);

CREATE TABLE incidents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    service_id BIGINT,
    incident_type ENUM('CANCELLATION', 'DEFECT') NOT NULL,
    severity ENUM('LOW', 'MEDIUM', 'CRITICAL') DEFAULT 'MEDIUM',
    location VARCHAR(255),
    request_support BOOLEAN DEFAULT FALSE,
    description TEXT,
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at DATETIME,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    CONSTRAINT fk_incident_service FOREIGN KEY (service_id) REFERENCES service(id)
);

-- =========================================================================
-- 2. TABELAS DE AUDITORIA (HIBERNATE ENVERS)
-- =========================================================================
CREATE TABLE revinfo (
    rev INT AUTO_INCREMENT PRIMARY KEY,
    revtstmp BIGINT
);

CREATE TABLE car_type_aud (
    id INT, rev INT, revtype TINYINT,
    brand VARCHAR(100), model VARCHAR(100), year INT, category VARCHAR(50), is_active BOOLEAN,
    created_at DATETIME, updated_at DATETIME, created_by VARCHAR(100), updated_by VARCHAR(100),
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_car_type_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);

CREATE TABLE users_aud (
    registration VARCHAR(50), rev INT, revtype TINYINT,
    name VARCHAR(100), email VARCHAR(255), password VARCHAR(255), permission VARCHAR(50),
    phone VARCHAR(20), gender VARCHAR(20), birth_date DATE, driver_license VARCHAR(20),
    driver_license_category VARCHAR(5), driver_license_expiration DATE, employee_status VARCHAR(50), is_active BOOLEAN,
    created_at DATETIME, updated_at DATETIME, created_by VARCHAR(100), updated_by VARCHAR(100),
    PRIMARY KEY (registration, rev),
    CONSTRAINT fk_users_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);

CREATE TABLE cars_aud (
    prefix VARCHAR(20), rev INT, revtype TINYINT,
    license_plate VARCHAR(10), type_id INT, fuel VARCHAR(20), current_km FLOAT,
    next_oil_change_km FLOAT, tank_capacity FLOAT, renavam VARCHAR(11), chassi VARCHAR(17),
    available BOOLEAN, color VARCHAR(30), required_license VARCHAR(20), vehicle_status VARCHAR(50),
    observations TEXT, is_active BOOLEAN,
    created_at DATETIME, updated_at DATETIME, created_by VARCHAR(100), updated_by VARCHAR(100),
    PRIMARY KEY (prefix, rev),
    CONSTRAINT fk_cars_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);

CREATE TABLE service_aud (
    id BIGINT, rev INT, revtype TINYINT,
    car_prefix VARCHAR(20), user_registration VARCHAR(50),
    departure_time DATETIME, arrival_time DATETIME, completion_time DATETIME, expected_completion_time DATETIME,
    departure_km FLOAT, arrival_km FLOAT,
    destination_requester VARCHAR(255), description TEXT, priority VARCHAR(20), is_active BOOLEAN,
    created_at DATETIME, updated_at DATETIME, created_by VARCHAR(100), updated_by VARCHAR(100),
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_service_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);

CREATE TABLE records_aud (
    id BIGINT, rev INT, revtype TINYINT,
    service_id BIGINT, record_type VARCHAR(50), record_date DATETIME, record_km FLOAT, note VARCHAR(255), is_active BOOLEAN,
    created_at DATETIME, updated_at DATETIME, created_by VARCHAR(100), updated_by VARCHAR(100),
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_records_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);

CREATE TABLE refuelings_aud (
    record_id BIGINT, rev INT, revtype TINYINT,
    liters FLOAT, price_per_liter DOUBLE, total_amount DOUBLE, fuel_type VARCHAR(20), gas_station_name VARCHAR(100), invoice VARCHAR(50), is_active BOOLEAN,
    created_at DATETIME, updated_at DATETIME, created_by VARCHAR(100), updated_by VARCHAR(100),
    PRIMARY KEY (record_id, rev),
    CONSTRAINT fk_refuelings_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);

CREATE TABLE incidents_aud (
    id BIGINT, rev INT, revtype TINYINT,
    service_id BIGINT, incident_type VARCHAR(50), severity VARCHAR(20), location VARCHAR(255),
    request_support BOOLEAN, description TEXT, resolved BOOLEAN, resolved_at DATETIME, is_active BOOLEAN,
    created_at DATETIME, updated_at DATETIME, created_by VARCHAR(100), updated_by VARCHAR(100),
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_incidents_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);
