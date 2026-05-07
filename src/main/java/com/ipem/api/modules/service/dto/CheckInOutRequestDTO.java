package com.ipem.api.modules.service.dto;

import com.ipem.api.modules.service.model.enums.Priority;

public record CheckInOutRequestDTO(
        String carPrefix,
        String userRegistration,
        Float recordKm,
        String note,
        Priority priority
) {}