package com.ipem.api.modules.service.dto;

public record DashboardMetricsDTO(
        long availableCars,
        long maintenanceCars,
        long inUseCars,
        long availableTechnicians,
        long onDutyTechnicians,
        double monthlyFuelSpend,
        double averagePricePerLiter,
        double totalLitersRefueled
) {}


