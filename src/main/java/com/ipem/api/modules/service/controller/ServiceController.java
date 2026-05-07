package com.ipem.api.modules.service.controller;

import com.ipem.api.modules.service.dto.CheckInOutRequestDTO;
import com.ipem.api.modules.service.service.ServiceService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/service")
@CrossOrigin(origins = "*")
public class ServiceController {

    private final ServiceService serviceService;

    public ServiceController(ServiceService serviceService) {
        this.serviceService = serviceService;
    }

    @PostMapping("/start")
    public ResponseEntity<?> startService(@RequestBody CheckInOutRequestDTO dto) {
        var service = serviceService.startService(dto);
        return ResponseEntity.ok(Map.of("serviceId", service.getId(), "message", "Check-in ok"));
    }

    @PostMapping("/finalize/{id}")
    public ResponseEntity<?> finalizeService(@PathVariable Long id, @RequestBody CheckInOutRequestDTO dto) {
        serviceService.finishService(id, dto.recordKm());
        return ResponseEntity.ok(Map.of("message", "Check-out ok"));
    }

    @PostMapping("/{id}/fuel")
    public ResponseEntity<?> registerFuel(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        serviceService.registerFuel(id,
                Double.valueOf(payload.get("amount").toString()),
                Double.valueOf(payload.get("totalValue").toString()),
                (String) payload.get("date"));
        return ResponseEntity.ok(Map.of("message", "Abastecimento ok"));
    }

    @GetMapping("/active")
    public ResponseEntity<?> getActive() {
        String registration = SecurityContextHolder.getContext().getAuthentication().getName();
        var service = serviceService.findActiveServiceByUser(registration);
        if (service != null) {
            return ResponseEntity.ok(Map.of(
                    "active", true, "serviceId", service.getId(),
                    "carPrefix", service.getCar().getPrefix(),
                    "departureTime", service.getDepartureTime(),
                    "model", service.getCar().getType().getModel(),
                    "licensePlate", service.getCar().getLicensePlate(),
                    "departureKm", service.getDepartureKm(),
                    "description", Optional.ofNullable(service.getDescription()).orElse("")
            ));
        }
        return ResponseEntity.ok(Map.of("active", false));
    }
}