package com.ipem.api.modules.service.repository;

import com.ipem.api.modules.service.model.Refueling;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RefuelingRepository extends JpaRepository<Refueling, Long> {

    @Query("SELECT a FROM Refueling a JOIN a.record r WHERE r.service.car.prefix = :prefix AND a.isActive = true AND r.isActive = true ORDER BY r.recordDate DESC")
    List<Refueling> findLatestRefuelingsByCar(@Param("prefix") String prefix);

    @Query("SELECT COALESCE(SUM(r.totalAmount), 0.0) FROM Refueling r JOIN r.record rec WHERE MONTH(rec.recordDate) = MONTH(CURRENT_DATE) AND YEAR(rec.recordDate) = YEAR(CURRENT_DATE) AND r.isActive = true")
    Double sumMonthlyFuelSpend();

    @Query("SELECT COALESCE(SUM(r.liters), 0.0) FROM Refueling r JOIN r.record rec WHERE MONTH(rec.recordDate) = MONTH(CURRENT_DATE) AND YEAR(rec.recordDate) = YEAR(CURRENT_DATE) AND r.isActive = true")
    Double sumMonthlyLiters();

    @Query("SELECT COALESCE(AVG(r.pricePerLiter), 0.0) FROM Refueling r JOIN r.record rec WHERE MONTH(rec.recordDate) = MONTH(CURRENT_DATE) AND YEAR(rec.recordDate) = YEAR(CURRENT_DATE) AND r.isActive = true")
    Double avgMonthlyPricePerLiter();
}