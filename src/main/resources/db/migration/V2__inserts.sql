-- =========================================================================
-- 1. LIMPEZA DE TABELAS
-- =========================================================================
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE refuelings;
TRUNCATE TABLE incidents;
TRUNCATE TABLE records;
TRUNCATE TABLE service_aud;
TRUNCATE TABLE service;
TRUNCATE TABLE cars;
TRUNCATE TABLE users;
TRUNCATE TABLE car_type;
TRUNCATE TABLE revinfo;
SET FOREIGN_KEY_CHECKS = 1;

-- =========================================================================
-- 2. TIPOS DE VEÍCULO
-- =========================================================================
INSERT INTO car_type (id, brand, model, year, category) VALUES 
(1, 'Toyota', 'Corolla', 2024, 'PASSENGER'), (2, 'Chevrolet', 'S10', 2023, 'UTILITY'), 
(3, 'Ford', 'Ranger', 2024, 'UTILITY'), (4, 'Volkswagen', 'Virtus', 2023, 'PASSENGER'), 
(5, 'Fiat', 'Cronos', 2022, 'PASSENGER'), (6, 'Renault', 'Oroch', 2023, 'UTILITY'), 
(7, 'Nissan', 'Frontier', 2024, 'UTILITY'), (8, 'Honda', 'HR-V', 2024, 'PASSENGER'), 
(9, 'Jeep', 'Renegade', 2023, 'PASSENGER'), (10, 'Ford', 'Transit', 2022, 'UTILITY'), 
(11, 'Renault', 'Duster', 2023, 'UTILITY'), (12, 'Fiat', 'Mobi', 2024, 'PASSENGER'), 
(13, 'Chevrolet', 'Onix', 2023, 'PASSENGER'), (14, 'Ford', 'Ka Sedan', 2021, 'PASSENGER'), 
(15, 'Volkswagen', 'Gol', 2022, 'PASSENGER'), (16, 'Toyota', 'Hilux', 2024, 'UTILITY');

-- =========================================================================
-- 3. USUÁRIOS (Senha padrão: "senha123")
-- =========================================================================
INSERT INTO users (registration, name, email, password, permission, phone, driver_license_category, employee_status) VALUES 
('10001', 'Ana Paula Martins', 'ana.paula@ipem.sp.gov.br', '$2a$10$YB1lLj/IMXD4Lm0cbAphKumArFegy1hC8yxr0Cm3/n4jm9kAd7rFi', 'TECHNICIAN', '11999990001', 'B', 'AVAILABLE'), 
('10002', 'Bruno Lima', 'bruno.lima@ipem.sp.gov.br', '$2a$10$YB1lLj/IMXD4Lm0cbAphKumArFegy1hC8yxr0Cm3/n4jm9kAd7rFi', 'TECHNICIAN', '11999990002', 'AB', 'AVAILABLE'), 
('10003', 'Marcos Vinicius', 'marcos.v@ipem.sp.gov.br', '$2a$10$YB1lLj/IMXD4Lm0cbAphKumArFegy1hC8yxr0Cm3/n4jm9kAd7rFi', 'TECHNICIAN', '11999990003', 'B', 'AVAILABLE'), 
('10004', 'Juliana Costa', 'juliana.c@ipem.sp.gov.br', '$2a$10$YB1lLj/IMXD4Lm0cbAphKumArFegy1hC8yxr0Cm3/n4jm9kAd7rFi', 'TECHNICIAN', '11999990004', 'AB', 'ON_DUTY'), 
('10005', 'Carla Mendes', 'carla.m@ipem.sp.gov.br', '$2a$10$YB1lLj/IMXD4Lm0cbAphKumArFegy1hC8yxr0Cm3/n4jm9kAd7rFi', 'TECHNICIAN', '11999990005', 'B', 'AVAILABLE'), 
('10006', 'Eduardo Alves', 'eduardo.alves@ipem.sp.gov.br', '$2a$10$YB1lLj/IMXD4Lm0cbAphKumArFegy1hC8yxr0Cm3/n4jm9kAd7rFi', 'ADMINISTRATOR', '11999990006', 'B', 'AVAILABLE'), 
('10007', 'Fernanda Rocha', 'fernanda.r@ipem.sp.gov.br', '$2a$10$YB1lLj/IMXD4Lm0cbAphKumArFegy1hC8yxr0Cm3/n4jm9kAd7rFi', 'TECHNICIAN', '11999990007', 'AB', 'ON_DUTY'), 
('10008', 'Niuan Spolidorio da Rocha Souza', 'niuan.souza@ipem.sp.gov.br', '$2a$10$YB1lLj/IMXD4Lm0cbAphKumArFegy1hC8yxr0Cm3/n4jm9kAd7rFi', 'ADMINISTRATOR', '11999990008', 'B', 'AVAILABLE'), 
('10009', 'Igor Mendes', 'igor.mendes@ipem.sp.gov.br', '$2a$10$YB1lLj/IMXD4Lm0cbAphKumArFegy1hC8yxr0Cm3/n4jm9kAd7rFi', 'TECHNICIAN', '11999990009', 'D', 'AVAILABLE'), 
('10010', 'Larissa Gomes', 'larissa.gomes@ipem.sp.gov.br', '$2a$10$YB1lLj/IMXD4Lm0cbAphKumArFegy1hC8yxr0Cm3/n4jm9kAd7rFi', 'TECHNICIAN', '11999990010', 'B', 'AVAILABLE'), 
('10011', 'Kevin Santos', 'kevin.santos@ipem.sp.gov.br', '$2a$10$YB1lLj/IMXD4Lm0cbAphKumArFegy1hC8yxr0Cm3/n4jm9kAd7rFi', 'TECHNICIAN', '11999990011', 'B', 'AVAILABLE'), 
('10012', 'Helena Duarte', 'helena.duarte@ipem.sp.gov.br', '$2a$10$YB1lLj/IMXD4Lm0cbAphKumArFegy1hC8yxr0Cm3/n4jm9kAd7rFi', 'ADMINISTRATOR', '11999990012', 'B', 'AVAILABLE'), 
('10013', 'Thiago Silva', 'thiago.silva@ipem.sp.gov.br', '$2a$10$YB1lLj/IMXD4Lm0cbAphKumArFegy1hC8yxr0Cm3/n4jm9kAd7rFi', 'TECHNICIAN', '11999990013', 'D', 'AVAILABLE'), 
('10014', 'Amanda Oliveira', 'amanda.o@ipem.sp.gov.br', '$2a$10$YB1lLj/IMXD4Lm0cbAphKumArFegy1hC8yxr0Cm3/n4jm9kAd7rFi', 'TECHNICIAN', '11999990014', 'B', 'AVAILABLE'), 
('10015', 'Rafael Pereira', 'rafael.p@ipem.sp.gov.br', '$2a$10$YB1lLj/IMXD4Lm0cbAphKumArFegy1hC8yxr0Cm3/n4jm9kAd7rFi', 'TECHNICIAN', '11999990015', 'AB', 'ON_DUTY'), 
('10016', 'Camila Ribeiro', 'carla.r@ipem.sp.gov.br', '$2a$10$YB1lLj/IMXD4Lm0cbAphKumArFegy1hC8yxr0Cm3/n4jm9kAd7rFi', 'TECHNICIAN', '11999990016', 'B', 'AVAILABLE'), 
('10017', 'Diego Nogueira', 'diego.n@ipem.sp.gov.br', '$2a$10$YB1lLj/IMXD4Lm0cbAphKumArFegy1hC8yxr0Cm3/n4jm9kAd7rFi', 'TECHNICIAN', '11999990017', 'B', 'AVAILABLE'), 
('10018', 'Aline Castro', 'aline.c@ipem.sp.gov.br', '$2a$10$YB1lLj/IMXD4Lm0cbAphKumArFegy1hC8yxr0Cm3/n4jm9kAd7rFi', 'TECHNICIAN', '11999990018', 'B', 'AVAILABLE'), 
('10019', 'Felipe Santos', 'felipe.s@ipem.sp.gov.br', '$2a$10$YB1lLj/IMXD4Lm0cbAphKumArFegy1hC8yxr0Cm3/n4jm9kAd7rFi', 'TECHNICIAN', '11999990019', 'AB', 'AVAILABLE'), 
('10020', 'Letícia Moraes', 'leticia.m@ipem.sp.gov.br', '$2a$10$YB1lLj/IMXD4Lm0cbAphKumArFegy1hC8yxr0Cm3/n4jm9kAd7rFi', 'TECHNICIAN', '11999990020', 'B', 'AVAILABLE');

-- =========================================================================
-- 4. VEÍCULOS DA FROTA
-- =========================================================================
INSERT INTO cars (prefix, license_plate, type_id, fuel, current_km, tank_capacity, vehicle_status, color) VALUES 
('CAR001', 'IPM1A11', 1, 'Gasoline', 15500.0, 45.0, 'AVAILABLE', 'Silver'), 
('CAR002', 'IPM1A12', 2, 'Diesel', 45800.0, 70.0, 'AVAILABLE', 'White'), 
('CAR003', 'IPM1A13', 3, 'Diesel', 9500.0, 80.0, 'AVAILABLE', 'Black'), 
('CAR004', 'IPM1A14', 4, 'Gasoline', 6200.0, 50.0, 'AVAILABLE', 'Red'), 
('CAR005', 'IPM1A15', 5, 'Gasoline', 22800.0, 45.0, 'AVAILABLE', 'Blue'), 
('CAR006', 'IPM1A16', 6, 'Diesel', 30500.0, 60.0, 'AVAILABLE', 'Gray'), 
('CAR007', 'IPM1A17', 7, 'Diesel', 12500.0, 75.0, 'UNAVAILABLE', 'White'), 
('CAR008', 'IPM1A18', 8, 'Gasoline', 95800.0, 50.0, 'IN_USE', 'Black'), 
('CAR009', 'IPM1A19', 9, 'Gasoline', 5400.0, 45.0, 'AVAILABLE', 'White'), 
('CAR010', 'IPM1A20', 10, 'Diesel', 4500.0, 75.0, 'AVAILABLE', 'Silver'), 
('CAR011', 'IPM1A21', 11, 'Gasoline', 1200.0, 50.0, 'AVAILABLE', 'White'), 
('CAR012', 'IPM1A22', 12, 'Gasoline', 15800.0, 40.0, 'AVAILABLE', 'Black'), 
('CAR013', 'IPM1A23', 13, 'Gasoline', 25600.0, 44.0, 'AVAILABLE', 'Silver'), 
('CAR014', 'IPM1A24', 14, 'Gasoline', 3900.0, 45.0, 'IN_USE', 'Gray'), 
('CAR015', 'IPM1A25', 15, 'Gasoline', 12400.0, 50.0, 'AVAILABLE', 'White'), 
('CAR016', 'IPM1A26', 16, 'Diesel', 18500.0, 80.0, 'AVAILABLE', 'Black'), 
('CAR017', 'IPM1A27', 1, 'Gasoline', 40200.0, 45.0, 'MAINTENANCE', 'Silver'), 
('CAR018', 'IPM1A28', 2, 'Diesel', 5400.0, 70.0, 'AVAILABLE', 'White'), 
('CAR019', 'IPM1A29', 3, 'Diesel', 8600.0, 80.0, 'AVAILABLE', 'Black'), 
('CAR020', 'IPM1A30', 4, 'Gasoline', 11500.0, 50.0, 'IN_USE', 'Silver');

-- =========================================================================
-- 5. SERVIÇOS (50 CHAMADOS DE JANEIRO A MAIO DE 2026)
-- =========================================================================
INSERT INTO service (id, car_prefix, user_registration, departure_time, completion_time, departure_km, destination_requester, description, priority, is_active) VALUES 
-- JANEIRO (Fechados)
(1, 'CAR001', '10001', '2026-01-05 08:00:00', '2026-01-05 17:00:00', 15000.0, 'São Paulo', 'Fiscalização de rotina', 'MEDIUM', 0),
(2, 'CAR003', '10003', '2026-01-10 09:00:00', '2026-01-10 16:30:00', 8900.0, 'Campinas', 'Visita Técnica', 'MEDIUM', 0),
(3, 'CAR004', '10004', '2026-01-15 07:30:00', '2026-01-15 15:00:00', 5500.0, 'Santos', 'Transporte', 'HIGH', 0),
(4, 'CAR005', '10006', '2026-01-18 08:00:00', '2026-01-18 18:00:00', 22000.0, 'Sorocaba', 'Reunião Externa', 'MEDIUM', 0),
(5, 'CAR006', '10007', '2026-01-20 10:00:00', '2026-01-20 14:00:00', 30000.0, 'Jundiaí', 'Fiscalização de Radar', 'LOW', 0),
(6, 'CAR008', '10009', '2026-01-23 08:00:00', '2026-01-23 16:00:00', 95000.0, 'SJC', 'Manutenção Preventiva', 'MEDIUM', 0),
(7, 'CAR009', '10010', '2026-01-25 09:00:00', '2026-01-25 12:00:00', 5000.0, 'Taubaté', 'Entrega de Equipamentos', 'LOW', 0),
(8, 'CAR010', '10011', '2026-01-28 08:30:00', '2026-01-28 17:30:00', 4000.0, 'Jacareí', 'Verificação Local', 'MEDIUM', 0),
(9, 'CAR011', '10012', '2026-01-30 07:00:00', '2026-01-30 15:00:00', 1000.0, 'Guarulhos', 'Visita Técnicaização', 'HIGH', 0),
(10, 'CAR012', '10013', '2026-01-31 08:00:00', '2026-01-31 16:00:00', 15000.0, 'Osasco', 'Fiscalização de Postos', 'MEDIUM', 0),

-- FEVEREIRO (Fechados)
(11, 'CAR013', '10014', '2026-02-04 08:00:00', '2026-02-04 17:00:00', 25000.0, 'Limeira', 'Aferição de Balanças', 'MEDIUM', 0),
(12, 'CAR014', '10015', '2026-02-06 07:30:00', '2026-02-06 14:30:00', 3500.0, 'Mogi das Cruzes', 'Vistoria', 'LOW', 0),
(13, 'CAR015', '10016', '2026-02-09 09:00:00', '2026-02-09 18:00:00', 12000.0, 'Barueri', 'Fiscalização', 'MEDIUM', 0),
(14, 'CAR016', '10017', '2026-02-12 08:00:00', '2026-02-12 16:00:00', 18000.0, 'Atibaia', 'Auditoria Interna', 'HIGH', 0),
(15, 'CAR018', '10018', '2026-02-15 08:00:00', '2026-02-15 15:30:00', 5000.0, 'Piracicaba', 'Visita Técnica', 'MEDIUM', 0),
(16, 'CAR019', '10019', '2026-02-18 08:00:00', '2026-02-18 17:00:00', 8000.0, 'Valinhos', 'Fiscalização de Comércio', 'MEDIUM', 0),
(17, 'CAR020', '10020', '2026-02-20 08:00:00', '2026-02-20 16:30:00', 11000.0, 'Hortolândia', 'Vistoria', 'LOW', 0),
(18, 'CAR001', '10008', '2026-02-23 09:00:00', '2026-02-23 18:00:00', 15300.0, 'SJC', 'Auditoria Regional', 'HIGH', 0),
(19, 'CAR002', '10005', '2026-02-25 08:00:00', '2026-02-25 17:00:00', 45500.0, 'Jacareí', 'Fiscalização de Bombas', 'MEDIUM', 0),
(20, 'CAR003', '10002', '2026-02-28 08:00:00', '2026-02-28 14:00:00', 9300.0, 'Taubaté', 'Vistoria Técnica', 'MEDIUM', 0),

-- MARÇO (Fechados)
(21, 'CAR004', '10003', '2026-03-02 08:00:00', '2026-03-02 17:00:00', 6000.0, 'São Paulo', 'Inspeção Anual', 'MEDIUM', 0),
(22, 'CAR005', '10004', '2026-03-05 09:00:00', '2026-03-05 16:00:00', 22500.0, 'Campinas', 'Fiscalização Tacógrafo', 'HIGH', 0),
(23, 'CAR006', '10006', '2026-03-08 07:30:00', '2026-03-08 14:30:00', 30500.0, 'Sorocaba', 'Acompanhamento', 'LOW', 0),
(24, 'CAR008', '10007', '2026-03-12 10:00:00', '2026-03-12 18:00:00', 95200.0, 'SJC', 'Aferição', 'MEDIUM', 0),
(25, 'CAR009', '10009', '2026-03-15 08:00:00', '2026-03-15 15:00:00', 5500.0, 'Jacareí', 'Fiscalização', 'MEDIUM', 0),
(26, 'CAR010', '10010', '2026-03-18 08:30:00', '2026-03-18 16:30:00', 4500.0, 'Taubaté', 'Verificação', 'HIGH', 0),
(27, 'CAR011', '10011', '2026-03-21 07:00:00', '2026-03-21 14:00:00', 1500.0, 'Guarulhos', 'Visita Técnica', 'LOW', 0),
(28, 'CAR012', '10012', '2026-03-24 09:00:00', '2026-03-24 17:30:00', 15500.0, 'Osasco', 'Auditoria', 'MEDIUM', 0),
(29, 'CAR013', '10013', '2026-03-27 08:00:00', '2026-03-27 16:00:00', 25500.0, 'Limeira', 'Fiscalização', 'MEDIUM', 0),
(30, 'CAR014', '10014', '2026-03-30 08:00:00', '2026-03-30 15:30:00', 4000.0, 'Mogi das Cruzes', 'Vistoria', 'HIGH', 0),

-- ABRIL (Fechados)
(31, 'CAR015', '10015', '2026-04-03 08:00:00', '2026-04-03 16:00:00', 12500.0, 'Barueri', 'Fiscalização Comercial', 'MEDIUM', 0),
(32, 'CAR016', '10016', '2026-04-06 09:00:00', '2026-04-06 17:00:00', 18500.0, 'Atibaia', 'Auditoria', 'MEDIUM', 0),
(33, 'CAR018', '10017', '2026-04-09 07:30:00', '2026-04-09 15:30:00', 5500.0, 'Piracicaba', 'Visita Técnica', 'LOW', 0),
(34, 'CAR019', '10018', '2026-04-12 08:00:00', '2026-04-12 18:00:00', 8500.0, 'Valinhos', 'Fiscalização de Postos', 'HIGH', 0),
(35, 'CAR020', '10019', '2026-04-15 10:00:00', '2026-04-15 16:00:00', 11500.0, 'Hortolândia', 'Vistoria', 'MEDIUM', 0),
(36, 'CAR001', '10020', '2026-04-18 08:00:00', '2026-04-18 15:00:00', 15600.0, 'SJC', 'Aferição de Radar', 'MEDIUM', 0),
(37, 'CAR002', '10001', '2026-04-21 09:00:00', '2026-04-21 16:30:00', 46000.0, 'Jacareí', 'Verificação de Rotina', 'LOW', 0),
(38, 'CAR003', '10002', '2026-04-24 08:30:00', '2026-04-24 17:30:00', 9600.0, 'Taubaté', 'Fiscalização Têxtil', 'HIGH', 0),
(39, 'CAR004', '10003', '2026-04-27 07:00:00', '2026-04-27 15:00:00', 6500.0, 'São Paulo', 'Reunião Externa', 'MEDIUM', 0),
(40, 'CAR005', '10006', '2026-04-30 08:00:00', '2026-04-30 16:00:00', 23000.0, 'Campinas', 'Visita Técnica', 'MEDIUM', 0),

-- MAIO (Mesclado: 7 fechados, 3 AINDA EM ANDAMENTO)
(41, 'CAR006', '10008', '2026-05-02 08:00:00', '2026-05-02 17:00:00', 31000.0, 'Sorocaba', 'Fiscalização Geral', 'MEDIUM', 0),
(42, 'CAR009', '10009', '2026-05-03 09:00:00', '2026-05-03 16:30:00', 5800.0, 'SJC', 'Entrega', 'LOW', 0),
(43, 'CAR010', '10010', '2026-05-04 07:30:00', '2026-05-04 15:00:00', 4800.0, 'Jacareí', 'Aferição', 'HIGH', 0),
(44, 'CAR011', '10011', '2026-05-04 08:00:00', '2026-05-04 18:00:00', 1800.0, 'Taubaté', 'Visita de Campo', 'MEDIUM', 0),
(45, 'CAR012', '10012', '2026-05-05 10:00:00', '2026-05-05 14:00:00', 15800.0, 'Guarulhos', 'Auditoria', 'MEDIUM', 0),
(46, 'CAR013', '10013', '2026-05-05 08:00:00', '2026-05-05 16:00:00', 25800.0, 'Osasco', 'Vistoria Tacógrafo', 'HIGH', 0),
(47, 'CAR015', '10016', '2026-05-06 09:00:00', '2026-05-06 15:00:00', 12800.0, 'Limeira', 'Fiscalização', 'LOW', 0),
-- Estes 3 estão "Em Andamento" (Sem data de conclusão) e is_active = 1
(48, 'CAR008', '10004', '2026-05-07 07:00:00', NULL, 95500.0, 'SJC', 'Manutenção corretiva e aferição', 'HIGH', 1),
(49, 'CAR014', '10007', '2026-05-07 08:30:00', NULL, 4200.0, 'Mogi das Cruzes', 'Transporte Administrativo', 'MEDIUM', 1),
(50, 'CAR020', '10015', '2026-05-07 09:00:00', NULL, 11800.0, 'Hortolândia', 'Ronda Fiscal', 'MEDIUM', 1);

-- =========================================================================
-- 6. REGISTROS (RECORDS) DOS CHAMADOS (Check-out e Abastecimentos)
-- =========================================================================
INSERT INTO records (id, service_id, record_type, record_date, record_km, note) VALUES 
-- Serviço 1 a 10 (Jan)
(1, 1, 'CHECK_OUT', '2026-01-05 08:00:00', 15000.0, 'Saída SP'),
(2, 1, 'REFUELING', '2026-01-05 10:00:00', 15100.0, 'Posto BR'),
(3, 2, 'CHECK_OUT', '2026-01-10 09:00:00', 8900.0, 'Saída Campinas'),
(4, 2, 'REFUELING', '2026-01-10 11:00:00', 9000.0, 'Posto Shell'),
(5, 3, 'CHECK_OUT', '2026-01-15 07:30:00', 5500.0, 'Saída Santos'),
(6, 3, 'REFUELING', '2026-01-15 10:00:00', 5700.0, 'Posto Ale'),
(7, 4, 'CHECK_OUT', '2026-01-18 08:00:00', 22000.0, 'Saída Sorocaba'),
(8, 4, 'REFUELING', '2026-01-18 12:00:00', 22200.0, 'Posto Ipiranga'),
(9, 5, 'CHECK_OUT', '2026-01-20 10:00:00', 30000.0, 'Saída Jundiaí'),
(10, 5, 'REFUELING', '2026-01-20 12:00:00', 30200.0, 'Posto BR'),
(11, 6, 'CHECK_OUT', '2026-01-23 08:00:00', 95000.0, 'Saída SJC'),
(12, 6, 'REFUELING', '2026-01-23 11:00:00', 95150.0, 'Posto Rede'),
(13, 7, 'CHECK_OUT', '2026-01-25 09:00:00', 5000.0, 'Saída Taubaté'),
(14, 7, 'REFUELING', '2026-01-25 10:30:00', 5200.0, 'Posto BR'),
(15, 8, 'CHECK_OUT', '2026-01-28 08:30:00', 4000.0, 'Saída Jacareí'),
(16, 8, 'REFUELING', '2026-01-28 12:00:00', 4200.0, 'Posto Shell'),
(17, 9, 'CHECK_OUT', '2026-01-30 07:00:00', 1000.0, 'Saída Guarulhos'),
(18, 9, 'REFUELING', '2026-01-30 09:00:00', 1150.0, 'Posto Ipiranga'),
(19, 10, 'CHECK_OUT', '2026-01-31 08:00:00', 15000.0, 'Saída Osasco'),
(20, 10, 'REFUELING', '2026-01-31 11:00:00', 15250.0, 'Posto Ale'),

-- Serviço 11 a 20 (Fev)
(21, 11, 'CHECK_OUT', '2026-02-04 08:00:00', 25000.0, 'Saída Limeira'),
(22, 11, 'REFUELING', '2026-02-04 10:00:00', 25200.0, 'Posto BR'),
(23, 12, 'CHECK_OUT', '2026-02-06 07:30:00', 3500.0, 'Saída Mogi'),
(24, 12, 'REFUELING', '2026-02-06 09:00:00', 3700.0, 'Posto Shell'),
(25, 13, 'CHECK_OUT', '2026-02-09 09:00:00', 12000.0, 'Saída Barueri'),
(26, 13, 'REFUELING', '2026-02-09 11:00:00', 12250.0, 'Posto BR'),
(27, 14, 'CHECK_OUT', '2026-02-12 08:00:00', 18000.0, 'Saída Atibaia'),
(28, 14, 'REFUELING', '2026-02-12 10:00:00', 18100.0, 'Posto Graal'),
(29, 15, 'CHECK_OUT', '2026-02-15 08:00:00', 5000.0, 'Saída Piracicaba'),
(30, 15, 'REFUELING', '2026-02-15 10:00:00', 5250.0, 'Posto Ipiranga'),
(31, 16, 'CHECK_OUT', '2026-02-18 08:00:00', 8000.0, 'Saída Valinhos'),
(32, 16, 'REFUELING', '2026-02-18 10:00:00', 8150.0, 'Posto Shell'),
(33, 17, 'CHECK_OUT', '2026-02-20 08:00:00', 11000.0, 'Saída Hortolândia'),
(34, 17, 'REFUELING', '2026-02-20 10:00:00', 11200.0, 'Posto BR'),
(35, 18, 'CHECK_OUT', '2026-02-23 09:00:00', 15300.0, 'Saída SJC'),
(36, 18, 'REFUELING', '2026-02-23 11:00:00', 15450.0, 'Posto Ipiranga'),
(37, 19, 'CHECK_OUT', '2026-02-25 08:00:00', 45500.0, 'Saída Jacareí'),
(38, 19, 'REFUELING', '2026-02-25 10:00:00', 45700.0, 'Posto Shell'),
(39, 20, 'CHECK_OUT', '2026-02-28 08:00:00', 9300.0, 'Saída Taubaté'),
(40, 20, 'REFUELING', '2026-02-28 10:00:00', 9450.0, 'Posto BR'),

-- Serviço 21 a 30 (Março)
(41, 21, 'CHECK_OUT', '2026-03-02 08:00:00', 6000.0, 'Saída SP'),
(42, 21, 'REFUELING', '2026-03-02 10:00:00', 6150.0, 'Posto BR'),
(43, 22, 'CHECK_OUT', '2026-03-05 09:00:00', 22500.0, 'Saída Campinas'),
(44, 22, 'REFUELING', '2026-03-05 11:00:00', 22700.0, 'Posto Ale'),
(45, 23, 'CHECK_OUT', '2026-03-08 07:30:00', 30500.0, 'Saída Sorocaba'),
(46, 23, 'REFUELING', '2026-03-08 09:30:00', 30700.0, 'Posto Graal'),
(47, 24, 'CHECK_OUT', '2026-03-12 10:00:00', 95200.0, 'Saída SJC'),
(48, 24, 'REFUELING', '2026-03-12 12:00:00', 95400.0, 'Posto BR'),
(49, 25, 'CHECK_OUT', '2026-03-15 08:00:00', 5500.0, 'Saída Jacareí'),
(50, 25, 'REFUELING', '2026-03-15 10:00:00', 5650.0, 'Posto Ipiranga'),
(51, 26, 'CHECK_OUT', '2026-03-18 08:30:00', 4500.0, 'Saída Taubaté'),
(52, 26, 'REFUELING', '2026-03-18 10:30:00', 4700.0, 'Posto Shell'),
(53, 27, 'CHECK_OUT', '2026-03-21 07:00:00', 1500.0, 'Saída Guarulhos'),
(54, 27, 'REFUELING', '2026-03-21 09:00:00', 1650.0, 'Posto BR'),
(55, 28, 'CHECK_OUT', '2026-03-24 09:00:00', 15500.0, 'Saída Osasco'),
(56, 28, 'REFUELING', '2026-03-24 11:00:00', 15700.0, 'Posto Ale'),
(57, 29, 'CHECK_OUT', '2026-03-27 08:00:00', 25500.0, 'Saída Limeira'),
(58, 29, 'REFUELING', '2026-03-27 10:00:00', 25700.0, 'Posto Ipiranga'),
(59, 30, 'CHECK_OUT', '2026-03-30 08:00:00', 4000.0, 'Saída Mogi'),
(60, 30, 'REFUELING', '2026-03-30 10:00:00', 4200.0, 'Posto Graal'),

-- Serviço 31 a 40 (Abril)
(61, 31, 'CHECK_OUT', '2026-04-03 08:00:00', 12500.0, 'Saída Barueri'),
(62, 31, 'REFUELING', '2026-04-03 10:00:00', 12700.0, 'Posto BR'),
(63, 32, 'CHECK_OUT', '2026-04-06 09:00:00', 18500.0, 'Saída Atibaia'),
(64, 32, 'REFUELING', '2026-04-06 11:00:00', 18700.0, 'Posto Ipiranga'),
(65, 33, 'CHECK_OUT', '2026-04-09 07:30:00', 5500.0, 'Saída Piracicaba'),
(66, 33, 'REFUELING', '2026-04-09 09:30:00', 5700.0, 'Posto Shell'),
(67, 34, 'CHECK_OUT', '2026-04-12 08:00:00', 8500.0, 'Saída Valinhos'),
(68, 34, 'REFUELING', '2026-04-12 10:00:00', 8700.0, 'Posto Ale'),
(69, 35, 'CHECK_OUT', '2026-04-15 10:00:00', 11500.0, 'Saída Hortolândia'),
(70, 35, 'REFUELING', '2026-04-15 12:00:00', 11700.0, 'Posto BR'),
(71, 36, 'CHECK_OUT', '2026-04-18 08:00:00', 15600.0, 'Saída SJC'),
(72, 36, 'REFUELING', '2026-04-18 10:00:00', 15800.0, 'Posto Ipiranga'),
(73, 37, 'CHECK_OUT', '2026-04-21 09:00:00', 46000.0, 'Saída Jacareí'),
(74, 37, 'REFUELING', '2026-04-21 11:00:00', 46200.0, 'Posto Shell'),
(75, 38, 'CHECK_OUT', '2026-04-24 08:30:00', 9600.0, 'Saída Taubaté'),
(76, 38, 'REFUELING', '2026-04-24 10:30:00', 9800.0, 'Posto BR'),
(77, 39, 'CHECK_OUT', '2026-04-27 07:00:00', 6500.0, 'Saída SP'),
(78, 39, 'REFUELING', '2026-04-27 09:00:00', 6700.0, 'Posto Ale'),
(79, 40, 'CHECK_OUT', '2026-04-30 08:00:00', 23000.0, 'Saída Campinas'),
(80, 40, 'REFUELING', '2026-04-30 10:00:00', 23200.0, 'Posto Graal'),

-- Serviço 41 a 50 (Maio)
(81, 41, 'CHECK_OUT', '2026-05-02 08:00:00', 31000.0, 'Saída Sorocaba'),
(82, 41, 'REFUELING', '2026-05-02 10:00:00', 31200.0, 'Posto BR'),
(83, 42, 'CHECK_OUT', '2026-05-03 09:00:00', 5800.0, 'Saída SJC'),
(84, 42, 'REFUELING', '2026-05-03 11:00:00', 6000.0, 'Posto Shell'),
(85, 43, 'CHECK_OUT', '2026-05-04 07:30:00', 4800.0, 'Saída Jacareí'),
(86, 43, 'REFUELING', '2026-05-04 09:30:00', 5000.0, 'Posto Ipiranga'),
(87, 44, 'CHECK_OUT', '2026-05-04 08:00:00', 1800.0, 'Saída Taubaté'),
(88, 44, 'REFUELING', '2026-05-04 10:00:00', 2000.0, 'Posto BR'),
(89, 45, 'CHECK_OUT', '2026-05-05 10:00:00', 15800.0, 'Saída Guarulhos'),
(90, 45, 'REFUELING', '2026-05-05 12:00:00', 16000.0, 'Posto Ale'),
(91, 46, 'CHECK_OUT', '2026-05-05 08:00:00', 25800.0, 'Saída Osasco'),
(92, 46, 'REFUELING', '2026-05-05 10:00:00', 26000.0, 'Posto Ipiranga'),
(93, 47, 'CHECK_OUT', '2026-05-06 09:00:00', 12800.0, 'Saída Limeira'),
(94, 47, 'REFUELING', '2026-05-06 11:00:00', 13000.0, 'Posto Shell'),
(95, 48, 'CHECK_OUT', '2026-05-07 07:00:00', 95500.0, 'Saída SJC - Em Andamento'),
(96, 48, 'REFUELING', '2026-05-07 08:00:00', 95550.0, 'Posto BR'),
(97, 49, 'CHECK_OUT', '2026-05-07 08:30:00', 4200.0, 'Saída Mogi - Em Andamento'),
(98, 49, 'REFUELING', '2026-05-07 09:30:00', 4250.0, 'Posto Ale'),
(99, 50, 'CHECK_OUT', '2026-05-07 09:00:00', 11800.0, 'Saída Hortolândia - Em Andamento'),
(100, 50, 'REFUELING', '2026-05-07 10:00:00', 11850.0, 'Posto Ipiranga');


-- =========================================================================
-- 7. ABASTECIMENTOS (50 abastecimentos, vinculados aos Records PARES)
-- =========================================================================
INSERT INTO refuelings (record_id, liters, price_per_liter, total_amount, invoice) VALUES 
(2, 50.0, 5.80, 290.00, 'NF1001'), (4, 40.0, 5.75, 230.00, 'NF1002'), 
(6, 30.0, 5.90, 177.00, 'NF1003'), (8, 60.0, 5.60, 336.00, 'NF1004'), 
(10, 45.0, 5.85, 263.25, 'NF1005'), (12, 55.0, 5.70, 313.50, 'NF1006'), 
(14, 35.0, 5.95, 208.25, 'NF1007'), (16, 40.0, 5.80, 232.00, 'NF1008'), 
(18, 50.0, 5.75, 287.50, 'NF1009'), (20, 38.0, 5.85, 222.30, 'NF1010'), 
(22, 42.0, 5.78, 242.76, 'NF1011'), (24, 55.0, 5.92, 325.60, 'NF1012'), 
(26, 48.0, 5.65, 271.20, 'NF1013'), (28, 30.0, 5.80, 174.00, 'NF1014'), 
(30, 35.0, 5.75, 201.25, 'NF1015'), (32, 40.0, 5.90, 236.00, 'NF1016'), 
(34, 45.0, 5.85, 263.25, 'NF1017'), (36, 50.0, 5.80, 290.00, 'NF1018'), 
(38, 30.0, 5.95, 178.50, 'NF1019'), (40, 40.0, 5.80, 232.00, 'NF1020'), 
(42, 45.0, 5.85, 263.25, 'NF1021'), (44, 35.0, 5.90, 206.50, 'NF1022'), 
(46, 50.0, 5.75, 287.50, 'NF1023'), (48, 60.0, 5.60, 336.00, 'NF1024'), 
(50, 48.0, 5.80, 278.40, 'NF1025'), (52, 42.0, 5.85, 245.70, 'NF1026'), 
(54, 55.0, 5.70, 313.50, 'NF1027'), (56, 38.0, 5.90, 224.20, 'NF1028'), 
(58, 45.0, 5.75, 258.75, 'NF1029'), (60, 50.0, 5.80, 290.00, 'NF1030'), 
(62, 35.0, 5.95, 208.25, 'NF1031'), (64, 40.0, 5.85, 234.00, 'NF1032'), 
(66, 60.0, 5.65, 339.00, 'NF1033'), (68, 48.0, 5.70, 273.60, 'NF1034'), 
(70, 50.0, 5.80, 290.00, 'NF1035'), (72, 42.0, 5.75, 241.50, 'NF1036'), 
(74, 55.0, 5.90, 324.50, 'NF1037'), (76, 38.0, 5.85, 222.30, 'NF1038'), 
(78, 45.0, 5.80, 261.00, 'NF1039'), (80, 50.0, 5.75, 287.50, 'NF1040'), 
(82, 30.0, 5.95, 178.50, 'NF1041'), (84, 40.0, 5.85, 234.00, 'NF1042'), 
(86, 60.0, 5.60, 336.00, 'NF1043'), (88, 48.0, 5.70, 273.60, 'NF1044'), 
(90, 50.0, 5.80, 290.00, 'NF1045'), (92, 42.0, 5.75, 241.50, 'NF1046'), 
(94, 55.0, 5.90, 324.50, 'NF1047'), (96, 38.0, 5.85, 222.30, 'NF1048'), 
(98, 45.0, 5.80, 261.00, 'NF1049'), (100, 50.0, 5.75, 287.50, 'NF1050');

-- =========================================================================
-- 8. INCIDENTES (Alguns espalhados para testar o sistema)
-- =========================================================================
INSERT INTO incidents (id, service_id, incident_type, location, request_support, description) VALUES 
(1, 2, 'DEFECT', 'Rodovia Bandeirantes KM 50', TRUE, 'Pneu furado, aguardando socorro'),
(2, 22, 'DEFECT', 'Rodovia Dutra KM 120', FALSE, 'Luz da injeção eletrônica acendeu, seguindo devagar'),
(3, 42, 'DEFECT', 'Avenida Paulista SP', TRUE, 'Bateria arriou, chamando guincho');

-- =========================================================================
-- 9. AUDITORIA ENVERS (Espelho para o Histórico de Chamados)
-- =========================================================================
INSERT INTO revinfo (rev, revtstmp) VALUES 
(1, 1767571200000), (2, 1768003200000), (3, 1768435200000), (4, 1768694400000), (5, 1768867200000),
(6, 1769126400000), (7, 1769299200000), (8, 1769558400000), (9, 1769731200000), (10, 1769817600000),
(11, 1770163200000), (12, 1770336000000), (13, 1770595200000), (14, 1770854400000), (15, 1771113600000),
(16, 1771372800000), (17, 1771545600000), (18, 1771804800000), (19, 1771977600000), (20, 1772236800000),
(21, 1772409600000), (22, 1772668800000), (23, 1772928000000), (24, 1773273600000), (25, 1773532800000),
(26, 1773792000000), (27, 1774051200000), (28, 1774310400000), (29, 1774569600000), (30, 1774828800000),
(31, 1775174400000), (32, 1775433600000), (33, 1775692800000), (34, 1775952000000), (35, 1776211200000),
(36, 1776470400000), (37, 1776729600000), (38, 1776988800000), (39, 1777248000000), (40, 1777507200000),
(41, 1777680000000), (42, 1777766400000), (43, 1777852800000), (44, 1777852800000), (45, 1777939200000),
(46, 1777939200000), (47, 1778025600000), (48, 1778112000000), (49, 1778112000000), (50, 1778112000000);

-- Inserindo o status espelho dos serviços criados acima (revtype 0 = Novo Cadastro)
INSERT INTO service_aud (id, rev, revtype, car_prefix, user_registration, departure_time, completion_time, departure_km, destination_requester, description, priority, is_active) VALUES 
(1, 1, 0, 'CAR001', '10001', '2026-01-05 08:00:00', '2026-01-05 17:00:00', 15000.0, 'São Paulo', 'Fiscalização de rotina', 'MEDIUM', 0),
(2, 2, 0, 'CAR003', '10003', '2026-01-10 09:00:00', '2026-01-10 16:30:00', 8900.0, 'Campinas', 'Visita Técnica', 'MEDIUM', 0),
(3, 3, 0, 'CAR004', '10004', '2026-01-15 07:30:00', '2026-01-15 15:00:00', 5500.0, 'Santos', 'Transporte', 'HIGH', 0),
(4, 4, 0, 'CAR005', '10006', '2026-01-18 08:00:00', '2026-01-18 18:00:00', 22000.0, 'Sorocaba', 'Reunião Externa', 'MEDIUM', 0),
(5, 5, 0, 'CAR006', '10007', '2026-01-20 10:00:00', '2026-01-20 14:00:00', 30000.0, 'Jundiaí', 'Fiscalização de Radar', 'LOW', 0),
(6, 6, 0, 'CAR008', '10009', '2026-01-23 08:00:00', '2026-01-23 16:00:00', 95000.0, 'SJC', 'Manutenção Preventiva', 'MEDIUM', 0),
(7, 7, 0, 'CAR009', '10010', '2026-01-25 09:00:00', '2026-01-25 12:00:00', 5000.0, 'Taubaté', 'Entrega de Equipamentos', 'LOW', 0),
(8, 8, 0, 'CAR010', '10011', '2026-01-28 08:30:00', '2026-01-28 17:30:00', 4000.0, 'Jacareí', 'Verificação Local', 'MEDIUM', 0),
(9, 9, 0, 'CAR011', '10012', '2026-01-30 07:00:00', '2026-01-30 15:00:00', 1000.0, 'Guarulhos', 'Visita Técnicaização', 'HIGH', 0),
(10, 10, 0, 'CAR012', '10013', '2026-01-31 08:00:00', '2026-01-31 16:00:00', 15000.0, 'Osasco', 'Fiscalização de Postos', 'MEDIUM', 0),

(11, 11, 0, 'CAR013', '10014', '2026-02-04 08:00:00', '2026-02-04 17:00:00', 25000.0, 'Limeira', 'Aferição de Balanças', 'MEDIUM', 0),
(12, 12, 0, 'CAR014', '10015', '2026-02-06 07:30:00', '2026-02-06 14:30:00', 3500.0, 'Mogi das Cruzes', 'Vistoria', 'LOW', 0),
(13, 13, 0, 'CAR015', '10016', '2026-02-09 09:00:00', '2026-02-09 18:00:00', 12000.0, 'Barueri', 'Fiscalização', 'MEDIUM', 0),
(14, 14, 0, 'CAR016', '10017', '2026-02-12 08:00:00', '2026-02-12 16:00:00', 18000.0, 'Atibaia', 'Auditoria Interna', 'HIGH', 0),
(15, 15, 0, 'CAR018', '10018', '2026-02-15 08:00:00', '2026-02-15 15:30:00', 5000.0, 'Piracicaba', 'Visita Técnica', 'MEDIUM', 0),
(16, 16, 0, 'CAR019', '10019', '2026-02-18 08:00:00', '2026-02-18 17:00:00', 8000.0, 'Valinhos', 'Fiscalização de Comércio', 'MEDIUM', 0),
(17, 17, 0, 'CAR020', '10020', '2026-02-20 08:00:00', '2026-02-20 16:30:00', 11000.0, 'Hortolândia', 'Vistoria', 'LOW', 0),
(18, 18, 0, 'CAR001', '10008', '2026-02-23 09:00:00', '2026-02-23 18:00:00', 15300.0, 'SJC', 'Auditoria Regional', 'HIGH', 0),
(19, 19, 0, 'CAR002', '10005', '2026-02-25 08:00:00', '2026-02-25 17:00:00', 45500.0, 'Jacareí', 'Fiscalização de Bombas', 'MEDIUM', 0),
(20, 20, 0, 'CAR003', '10002', '2026-02-28 08:00:00', '2026-02-28 14:00:00', 9300.0, 'Taubaté', 'Vistoria Técnica', 'MEDIUM', 0),

(21, 21, 0, 'CAR004', '10003', '2026-03-02 08:00:00', '2026-03-02 17:00:00', 6000.0, 'São Paulo', 'Inspeção Anual', 'MEDIUM', 0),
(22, 22, 0, 'CAR005', '10004', '2026-03-05 09:00:00', '2026-03-05 16:00:00', 22500.0, 'Campinas', 'Fiscalização Tacógrafo', 'HIGH', 0),
(23, 23, 0, 'CAR006', '10006', '2026-03-08 07:30:00', '2026-03-08 14:30:00', 30500.0, 'Sorocaba', 'Acompanhamento', 'LOW', 0),
(24, 24, 0, 'CAR008', '10007', '2026-03-12 10:00:00', '2026-03-12 18:00:00', 95200.0, 'SJC', 'Aferição', 'MEDIUM', 0),
(25, 25, 0, 'CAR009', '10009', '2026-03-15 08:00:00', '2026-03-15 15:00:00', 5500.0, 'Jacareí', 'Fiscalização', 'MEDIUM', 0),
(26, 26, 0, 'CAR010', '10010', '2026-03-18 08:30:00', '2026-03-18 16:30:00', 4500.0, 'Taubaté', 'Verificação', 'HIGH', 0),
(27, 27, 0, 'CAR011', '10011', '2026-03-21 07:00:00', '2026-03-21 14:00:00', 1500.0, 'Guarulhos', 'Visita Técnica', 'LOW', 0),
(28, 28, 0, 'CAR012', '10012', '2026-03-24 09:00:00', '2026-03-24 17:30:00', 15500.0, 'Osasco', 'Auditoria', 'MEDIUM', 0),
(29, 29, 0, 'CAR013', '10013', '2026-03-27 08:00:00', '2026-03-27 16:00:00', 25500.0, 'Limeira', 'Fiscalização', 'MEDIUM', 0),
(30, 30, 0, 'CAR014', '10014', '2026-03-30 08:00:00', '2026-03-30 15:30:00', 4000.0, 'Mogi das Cruzes', 'Vistoria', 'HIGH', 0),

(31, 31, 0, 'CAR015', '10015', '2026-04-03 08:00:00', '2026-04-03 16:00:00', 12500.0, 'Barueri', 'Fiscalização Comercial', 'MEDIUM', 0),
(32, 32, 0, 'CAR016', '10016', '2026-04-06 09:00:00', '2026-04-06 17:00:00', 18500.0, 'Atibaia', 'Auditoria', 'MEDIUM', 0),
(33, 33, 0, 'CAR018', '10017', '2026-04-09 07:30:00', '2026-04-09 15:30:00', 5500.0, 'Piracicaba', 'Visita Técnica', 'LOW', 0),
(34, 34, 0, 'CAR019', '10018', '2026-04-12 08:00:00', '2026-04-12 18:00:00', 8500.0, 'Valinhos', 'Fiscalização de Postos', 'HIGH', 0),
(35, 35, 0, 'CAR020', '10019', '2026-04-15 10:00:00', '2026-04-15 16:00:00', 11500.0, 'Hortolândia', 'Vistoria', 'MEDIUM', 0),
(36, 36, 0, 'CAR001', '10020', '2026-04-18 08:00:00', '2026-04-18 15:00:00', 15600.0, 'SJC', 'Aferição de Radar', 'MEDIUM', 0),
(37, 37, 0, 'CAR002', '10001', '2026-04-21 09:00:00', '2026-04-21 16:30:00', 46000.0, 'Jacareí', 'Verificação de Rotina', 'LOW', 0),
(38, 38, 0, 'CAR003', '10002', '2026-04-24 08:30:00', '2026-04-24 17:30:00', 9600.0, 'Taubaté', 'Fiscalização Têxtil', 'HIGH', 0),
(39, 39, 0, 'CAR004', '10003', '2026-04-27 07:00:00', '2026-04-27 15:00:00', 6500.0, 'São Paulo', 'Reunião Externa', 'MEDIUM', 0),
(40, 40, 0, 'CAR005', '10006', '2026-04-30 08:00:00', '2026-04-30 16:00:00', 23000.0, 'Campinas', 'Visita Técnica', 'MEDIUM', 0),

(41, 41, 0, 'CAR006', '10008', '2026-05-02 08:00:00', '2026-05-02 17:00:00', 31000.0, 'Sorocaba', 'Fiscalização Geral', 'MEDIUM', 0),
(42, 42, 0, 'CAR009', '10009', '2026-05-03 09:00:00', '2026-05-03 16:30:00', 5800.0, 'SJC', 'Entrega', 'LOW', 0),
(43, 43, 0, 'CAR010', '10010', '2026-05-04 07:30:00', '2026-05-04 15:00:00', 4800.0, 'Jacareí', 'Aferição', 'HIGH', 0),
(44, 44, 0, 'CAR011', '10011', '2026-05-04 08:00:00', '2026-05-04 18:00:00', 1800.0, 'Taubaté', 'Visita de Campo', 'MEDIUM', 0),
(45, 45, 0, 'CAR012', '10012', '2026-05-05 10:00:00', '2026-05-05 14:00:00', 15800.0, 'Guarulhos', 'Auditoria', 'MEDIUM', 0),
(46, 46, 0, 'CAR013', '10013', '2026-05-05 08:00:00', '2026-05-05 16:00:00', 25800.0, 'Osasco', 'Vistoria Tacógrafo', 'HIGH', 0),
(47, 47, 0, 'CAR015', '10016', '2026-05-06 09:00:00', '2026-05-06 15:00:00', 12800.0, 'Limeira', 'Fiscalização', 'LOW', 0),
(48, 48, 0, 'CAR008', '10004', '2026-05-07 07:00:00', NULL, 95500.0, 'SJC', 'Manutenção corretiva e aferição', 'HIGH', 1),
(49, 49, 0, 'CAR014', '10007', '2026-05-07 08:30:00', NULL, 4200.0, 'Mogi das Cruzes', 'Transporte Administrativo', 'MEDIUM', 1),
(50, 50, 0, 'CAR020', '10015', '2026-05-07 09:00:00', NULL, 11800.0, 'Hortolândia', 'Ronda Fiscal', 'MEDIUM', 1);
