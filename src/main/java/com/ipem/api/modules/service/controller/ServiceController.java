package com.ipem.api.modules.service.controller;

import com.ipem.api.modules.service.dto.CheckInOutRequestDTO;
import com.ipem.api.modules.service.dto.DashboardMetricsDTO;
import com.ipem.api.modules.service.dto.ServiceReportMonthDTO;
import com.ipem.api.modules.service.service.DashboardService;
import com.ipem.api.modules.service.service.ServiceService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller responsável pelas operações de atendimento/serviço.
 * Gerencia o fluxo de check-in, check-out, relatórios e auditoria.
 */
@RestController
@RequestMapping("/service")
@CrossOrigin(origins = "*") // Permite acesso de diferentes origens (CORS)
public class ServiceController {

    private final ServiceService serviceService;
    private final DashboardService dashboardService;

    public ServiceController(ServiceService serviceService, DashboardService dashboardService) {
        this.serviceService = serviceService;
        this.dashboardService = dashboardService;
    }

    /**
     * Inicia um novo serviço (Check-in).
     */
    @PostMapping("/start")
    public ResponseEntity<?> startService(@RequestBody CheckInOutRequestDTO dto) {
        try {
            var service = serviceService.startService(dto);
            return ResponseEntity.ok(Map.of(
                    "message", "Check-in realizado com sucesso!",
                    "serviceId", service.getId()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Finaliza um serviço em aberto (Check-out).
     */
    @PostMapping("/finalize/{id}")
    public ResponseEntity<?> finalizeService(@PathVariable Long id, @RequestBody CheckInOutRequestDTO dto) {
        try {
            serviceService.finishService(id, dto.recordKm());
            return ResponseEntity.ok(Map.of("message", "Check-out concluído com sucesso!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Erro no checkout: " + e.getMessage()));
        }
    }

    /**
     * Retorna relatórios agrupados por mês.
     * @param months Quantidade de meses retroativos (padrão 6).
     */
    @GetMapping("/reports")
    public ResponseEntity<?> getReports(@RequestParam(required = false, defaultValue = "6") int months) {
        try {
            List<ServiceReportMonthDTO> reports = serviceService.getMonthlyServiceReports(months);
            return ResponseEntity.ok(Map.of("reports", reports));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Retorna métricas gerais para o dashboard.
     */
    @GetMapping("/dashboard")
    public ResponseEntity<DashboardMetricsDTO> getDashboardMetrics() {
        return ResponseEntity.ok(dashboardService.getMetrics());
    }

    /**
     * Recupera o histórico de alterações da entidade Service (Auditoria via Hibernate Envers).
     */
    @GetMapping("/history")
    public ResponseEntity<?> getAttendanceHistory() {
        try {
            List<Map<String, Object>> history = serviceService.getAttendanceAuditHistory();
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                    Map.of("error", "Erro ao buscar histórico de auditoria: " + e.getMessage())
            );
        }
    }

    /**
     * Verifica se o usuário autenticado possui algum serviço ativo no momento.
     */
    @GetMapping("/active")
    public ResponseEntity<?> getActiveService() {
        try {
            // Extrai a matrícula do usuário do contexto de segurança do Spring Security
            String registration = SecurityContextHolder.getContext().getAuthentication().getName();
            var service = serviceService.findActiveServiceByUser(registration);

            if (service != null) {
                return ResponseEntity.ok(Map.of(
                        "active", true,
                        "serviceId", service.getId(),
                        "carPrefix", service.getCar().getPrefix(),
                        "model", service.getCar().getType().getModel(),
                        "licensePlate", service.getCar().getLicensePlate(),
                        "departureKm", service.getDepartureKm(),
                        "departureTime", service.getDepartureTime(),
                        "description", service.getDescription() != null ? service.getDescription() : ""
                ));
            }
            return ResponseEntity.ok(Map.of("active", false, "message", "Nenhum serviço ativo."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}