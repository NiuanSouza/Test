package com.ipem.api.modules.user.controller;

import com.ipem.api.infrastructure.security.TokenService;
import com.ipem.api.modules.user.dto.*;
import com.ipem.api.modules.user.model.User;
import com.ipem.api.modules.user.model.enums.Permission;
import com.ipem.api.modules.user.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/user")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService service;
    private final AuthenticationManager authenticationManager;
    private final TokenService tokenService;

    public UserController(UserService service, AuthenticationManager authenticationManager, TokenService tokenService) {
        this.service = service;
        this.authenticationManager = authenticationManager;
        this.tokenService = tokenService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody @Valid LoginDTO data) {
        try {
            var authenticationToken = new UsernamePasswordAuthenticationToken(data.registration(), data.password());
            var authentication = authenticationManager.authenticate(authenticationToken);

            var user = (User) authentication.getPrincipal();
            var tokenJWT = tokenService.generateToken(user);

            return ResponseEntity.ok(Map.of(
                    "token", tokenJWT,
                    "permission", user.getPermission().name(),
                    "name", user.getName()
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Matrícula ou senha incorretos.");
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody @Valid RegisterDTO data) {
        try {
            User newUser = service.registerUser(data);
            return ResponseEntity.status(HttpStatus.CREATED).body(newUser);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/update/{registration}")
    public ResponseEntity<?> update(@PathVariable String registration, @RequestBody Map<String, Object> updates) {
        try {
            User updatedUser = service.updateUserFields(registration, updates);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Erro ao atualizar: " + e.getMessage()));
        }
    }

    @GetMapping("/technicians")
    public ResponseEntity<List<User>> listTechnicians() {
        var technicians = service.findAllByPermission(Permission.TECHNICIAN);
        return ResponseEntity.ok(technicians);
    }
}