package com.ipem.api.modules.service.repository;

import com.ipem.api.modules.service.model.Service;
import com.ipem.api.modules.vehicle.model.Car;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ServiceRepository extends JpaRepository<Service, Long> {

    @Query("SELECT a FROM Service a WHERE a.car.prefix = :prefix AND a.isActive = true")
    List<Service> findByCarPrefix(@Param("prefix") String prefix);

    List<Service> findByDepartureTimeBetweenAndIsActiveTrue(LocalDateTime start, LocalDateTime end);

    List<Service> findByCarPrefixAndCompletionTimeIsNull(String prefix);

    List<Service> findByCarAndCompletionTimeIsNullAndIsActiveTrue(Car car);

    List<Service> findByDepartureTimeBetween(LocalDateTime start, LocalDateTime end);

    Optional<Service> findFirstByCarAndCompletionTimeIsNullAndIsActiveTrueOrderByCreatedAtDesc(Car car);

    Optional<Service> findByUserRegistrationAndIsActiveTrue(String userRegistration);

}