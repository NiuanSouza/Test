package com.ipem.api.modules.service.dto;

public record ServiceReportEntryDTO(
        Long id,
        String carPrefix,
        String userRegistration,
        String userName,
        String description,
        String departureTime,
        String arrivalTime,
        String completionTime,
        String status,
        Float departureKm,
        Float arrivalKm,
        String destinationRequester
) {
}
