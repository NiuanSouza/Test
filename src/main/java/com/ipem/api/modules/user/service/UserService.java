package com.ipem.api.modules.user.service;

import com.ipem.api.modules.user.dto.RegisterDTO;
import com.ipem.api.modules.user.model.User;
import com.ipem.api.modules.user.model.enums.EmployeeStatus;
import com.ipem.api.modules.user.model.enums.Permission;
import com.ipem.api.modules.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
public class UserService {

    private final UserRepository repository;

    public UserService(UserRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public User registerUser(RegisterDTO data) {
        if (repository.existsById(data.registration())) {
            throw new RuntimeException("Registration already exists!");
        }

        User newUser = User.builder()
                .registration(data.registration())
                .name(data.name())
                .email(data.email())
                .password(data.password())
                .permission(data.permission())
                .build();

        newUser.setIsActive(true);

        return repository.save(newUser);
    }

    public List<User> findAllByPermission(Permission permission) {
        return repository.findByPermissionAndIsActiveTrue(permission);
    }

    @Transactional
    public void deleteUser(String registration) {
        User user = repository.findById(registration)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setIsActive(false);
        repository.save(user);
    }

    public User updateUserFields(String registration, Map<String, Object> updates) {
        // Busca o usuário pela matrícula (registration)
        // O SQLRestriction "is_active = true" já filtrará usuários inativos automaticamente
        User user = repository.findById(registration)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado com a matrícula: " + registration));

        updates.forEach((key, value) -> {
            if (value == null) return; // Ignora valores nulos enviados no mapa

            switch (key) {
                case "name":
                    user.setName((String) value);
                    break;
                case "email":
                    user.setEmail((String) value);
                    break;
                case "phone":
                    user.setPhone((String) value);
                    break;
                case "gender":
                    user.setGender((String) value);
                    break;
                case "employeeStatus":
                    user.setEmployeeStatus(EmployeeStatus.valueOf(value.toString().toUpperCase()));
                    break;
                case "permission":
                    user.setPermission(Permission.valueOf(value.toString().toUpperCase()));
                    break;
                case "driverLicense":
                    user.setDriverLicense((String) value);
                    break;
                case "driverLicenseCategory":
                    user.setDriverLicenseCategory((String) value);
                    break;
                case "driverLicenseExpiration":
                    user.setDriverLicenseExpiration(LocalDate.parse(value.toString()));
                    break;
                case "birthDate":
                    user.setBirthDate(LocalDate.parse(value.toString()));
                    break;
                case "isActive":
                    user.setIsActive((Boolean) value);
                    break;
                default:
                    break;
            }
        });

        return repository.save(user);
    }
}