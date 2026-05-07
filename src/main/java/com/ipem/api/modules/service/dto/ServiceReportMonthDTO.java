package com.ipem.api.modules.service.dto;

import java.util.List;

public record ServiceReportMonthDTO(
        String monthLabel,
        int year,
        int totalCalls,
        int completedCalls,
        int openCalls,
        boolean isCurrentMonth,
        String status,
        List<ServiceReportEntryDTO> entries
) {
}
