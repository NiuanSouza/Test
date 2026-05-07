package com.ipem.api.modules.vehicle.repository;

import com.ipem.api.modules.vehicle.model.Car;
import com.ipem.api.modules.vehicle.model.enums.VehicleStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface CarRepository extends JpaRepository<Car, String> {

    List<Car> findByVehicleStatusAndIsActiveTrue(String status);

    @Query("SELECT c FROM Car c WHERE c.currentKm >= (c.nextOilChangeKm - 500) AND c.isActive = true")
    List<Car> findCarsNeedingMaintenance();

    @Query("SELECT COUNT(c) FROM Car c WHERE c.vehicleStatus = :status AND c.isActive = true")
    Long countByStatus(@Param("status") VehicleStatus status);

    Car findByLicensePlateAndIsActiveTrue(String licensePlate);
}