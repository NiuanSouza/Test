// ==================================================================
// ARQUIVO: com.ipem.api.modules.vehicle.service.VehicleService.java
// ==================================================================
package com.ipem.api.modules.vehicle.service;

import com.ipem.api.modules.service.model.Service;
import com.ipem.api.modules.service.model.Record;
import com.ipem.api.modules.service.model.Refueling;
import com.ipem.api.modules.service.model.enums.RecordType;
import com.ipem.api.modules.service.repository.RefuelingRepository;
import com.ipem.api.modules.service.repository.ServiceRepository;
import com.ipem.api.modules.vehicle.model.Car;
import com.ipem.api.modules.vehicle.model.CarType;
import com.ipem.api.modules.vehicle.repository.CarRepository;
import com.ipem.api.modules.vehicle.repository.CarTypeRepository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@org.springframework.stereotype.Service
public class VehicleService {

    private final CarRepository carRepository;
    private final CarTypeRepository carTypeRepository;
    private final RefuelingRepository refuelingRepository;
    private final ServiceRepository serviceRepository;

    public VehicleService(CarRepository carRepository,
                          CarTypeRepository carTypeRepository,
                          RefuelingRepository refuelingRepository,
                          ServiceRepository serviceRepository) {
        this.carRepository = carRepository;
        this.carTypeRepository = carTypeRepository;
        this.refuelingRepository = refuelingRepository;
        this.serviceRepository = serviceRepository;
    }

    @Transactional
    public void updateKmAndObs(String prefix, Float km, String obs) {
        Car car = carRepository.findById(prefix)
                .orElseThrow(() -> new RuntimeException("Veículo não encontrado com o prefixo: " + prefix));

        car.setCurrentKm(km);
        car.setObservations(obs);
        carRepository.save(car);
    }

    @Transactional
    public Car register(Car car) {
        if (car.getType() != null) {
            if (car.getType().getId() == null) {
                carTypeRepository.save(car.getType());
            } else {
                CarType existingType = carTypeRepository.findById(car.getType().getId())
                        .orElseThrow(() -> new RuntimeException("Tipo de veículo inválido"));
                car.setType(existingType);
            }
        }
        car.setAvailable(true);
        car.setCurrentKm(0.0f);
        car.setIsActive(true);
        return carRepository.save(car);
    }

    @Transactional
    public void registerFuel(String prefix, Double value, String dateStr) {
        Car car = carRepository.findById(prefix)
                .orElseThrow(() -> new RuntimeException("Veículo não encontrado"));

        Service currentService = serviceRepository.findFirstByCarAndCompletionTimeIsNullAndIsActiveTrueOrderByCreatedAtDesc(car)
                .orElseThrow(() -> new RuntimeException("Não há serviço em aberto para realizar o abastecimento"));

        Record record = new Record();
        record.setService(currentService);
        record.setRecordType(RecordType.REFUELING);
        record.setRecordDate(LocalDateTime.now());
        record.setRecordKm(car.getCurrentKm());
        record.setIsActive(true);

        Refueling refueling = new Refueling();
        refueling.setRecord(record);
        refueling.setTotalAmount(value);
        refueling.setIsActive(true);

        refuelingRepository.save(refueling);
    }

    public Map<String, Object> getCurrentService() {
        Map<String, Object> chamado = new HashMap<>();
        chamado.put("id", 1);
        chamado.put("description", "Atendimento em rota - Fiscalização");
        chamado.put("status", "EM_ANDAMENTO");
        return chamado;
    }

    @Transactional
    public void deleteCar(String prefix) {
        Car car = carRepository.findById(prefix)
                .orElseThrow(() -> new RuntimeException("Veículo não encontrado"));
        car.setIsActive(false);
        carRepository.save(car);
    }

    public List<CarType> findAllActiveTypes() {
        try {
            return carTypeRepository.findAll();
        } catch (Exception e) {
            throw new RuntimeException("Erro ao buscar tipos de veículos: " + e.getMessage());
        }
    }

    public List<Car> findAllCars() {
        try {
            return carRepository.findAll();
        } catch (Exception e) {
            throw new RuntimeException("Erro ao buscar veículos: " + e.getMessage());
        }
    }
}