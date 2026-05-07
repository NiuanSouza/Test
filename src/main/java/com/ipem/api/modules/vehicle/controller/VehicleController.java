package com.ipem.api.modules.vehicle.controller;

import com.ipem.api.modules.vehicle.dto.CarUpdateDTO;
import com.ipem.api.modules.vehicle.dto.FuelRequestDTO;
import com.ipem.api.modules.vehicle.model.Car;
import com.ipem.api.modules.vehicle.service.VehicleService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/vehicle")
@CrossOrigin(origins = "*")
public class VehicleController {

    private final VehicleService vehicleService;

    public VehicleController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    @PatchMapping("/{prefix}/update-data")
    public ResponseEntity<?> updateData(@PathVariable String prefix, @RequestBody @Valid CarUpdateDTO data) {
        try {
            vehicleService.updateKmAndObs(prefix.trim(), data.mileage(), data.observations());
            return ResponseEntity.ok(Map.of("message", "Dados do veículo atualizados com sucesso!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerCar(@RequestBody @Valid Car car) {
        try {
            var newCar = vehicleService.register(car);
            return ResponseEntity.ok(Map.of("message", "Veículo cadastrado com sucesso!", "prefix", newCar.getPrefix()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{prefix}/fuel")
    public ResponseEntity<?> registerFuel(@PathVariable String prefix, @RequestBody @Valid FuelRequestDTO data) {
        try {
            vehicleService.registerFuel(prefix, data.value(), data.date());
            return ResponseEntity.ok(Map.of("message", "Abastecimento registrado com sucesso!"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
    @GetMapping("/types")
    public ResponseEntity<?> listCarTypes() {
        try {
            return ResponseEntity.ok(vehicleService.findAllActiveTypes());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/service/current")
    public ResponseEntity<?> getCurrentService() {
        return ResponseEntity.ok(vehicleService.getCurrentService());
    }

    @GetMapping
    public ResponseEntity<?> listAllCars() {
        try {
            return ResponseEntity.ok(vehicleService.findAllCars());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}