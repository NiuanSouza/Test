package com.ipem.api.modules.vehicle.repository;

import com.ipem.api.modules.vehicle.model.CarType;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CarTypeRepository extends JpaRepository<CarType, Integer> {

    List<CarType> findByCategoryAndIsActiveTrue(String category);

    List<CarType> findByModelContainingIgnoreCaseAndIsActiveTrue(String model);
}