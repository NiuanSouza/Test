package com.ipem.api.modules.service.controller;

import com.ipem.api.modules.service.dto.DashboardMetricsDTO;
import com.ipem.api.modules.service.dto.ServiceReportMonthDTO;
import com.ipem.api.modules.service.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/metrics")
    public ResponseEntity<DashboardMetricsDTO> getMetrics() {
        return ResponseEntity.ok(dashboardService.getMetrics());
    }

    @GetMapping("/history")
    public ResponseEntity<?> getHistory() {
        return ResponseEntity.ok(dashboardService.getServiceAuditHistory());
    }

    @GetMapping("/reports")
    public ResponseEntity<?> getReports(@RequestParam(defaultValue = "6") int months) {
        List<ServiceReportMonthDTO> reports = dashboardService.getMonthlyServiceReports(months);
        return ResponseEntity.ok(Map.of("reports", reports));
    }
}