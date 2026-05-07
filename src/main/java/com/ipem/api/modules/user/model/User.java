package com.ipem.api.modules.user.model;

import com.ipem.api.infrastructure.models.BaseEntity;
import com.ipem.api.modules.user.model.enums.Permission;
import com.ipem.api.modules.user.model.enums.EmployeeStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLRestriction;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@SQLRestriction("is_active = true")
public class User extends BaseEntity implements UserDetails {

    @Id
    @Column(length = 50)
    private String registration;

    private String name;
    private String email;
    private String password;

    @Enumerated(EnumType.STRING)
    private Permission permission;

    private String phone;
    private String gender;
    private LocalDate birthDate;
    private String driverLicense;

    @Column(columnDefinition = "TEXT")
    private String image_url;

    @Enumerated(EnumType.STRING)
    @Column(name = "employee_status")
    private EmployeeStatus employeeStatus;

    public User(String registration, String name, String email, String password,
                Permission permission, String phone, String gender,
                LocalDate birthDate, String driverLicense, EmployeeStatus employeeStatus,
                LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.registration = registration;
        this.name = name;
        this.email = email;
        this.password = password;
        this.permission = permission;
        this.phone = phone;
        this.gender = gender;
        this.birthDate = birthDate;
        this.driverLicense = driverLicense;
        this.employeeStatus = employeeStatus;
        this.setCreatedAt(createdAt);
        this.setUpdatedAt(updatedAt);
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + permission.name().toUpperCase()));
    }

    @Override
    public String getPassword() { return password; }

    @Override
    public String getUsername() {return this.registration;}

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }

    @Column(name = "is_active", columnDefinition = "boolean default true")
    private Boolean isActive = true;

    private String driverLicenseCategory;
    private LocalDate driverLicenseExpiration;
}