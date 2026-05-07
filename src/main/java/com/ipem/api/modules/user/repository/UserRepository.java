package com.ipem.api.modules.user.repository;

import com.ipem.api.modules.user.model.User;
import com.ipem.api.modules.user.model.enums.EmployeeStatus;
import com.ipem.api.modules.user.model.enums.Permission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {

    Optional<User> findByRegistrationAndIsActiveTrue(String registration);
    Optional<User> findByEmailAndIsActiveTrue(String email);

    boolean existsByRegistrationAndIsActiveTrue(String registration);
    boolean existsByEmailAndIsActiveTrue(String email);

    List<User> findByPermissionAndIsActiveTrue(Permission permission);

    List<User> findByEmployeeStatusAndIsActiveTrue(EmployeeStatus status);
    List<User> findByNameContainingIgnoreCaseAndIsActiveTrue(String name);

    @Query("SELECT COUNT(u) FROM User u WHERE u.permission = 'TECHNICIAN' AND u.employeeStatus = :status AND u.isActive = true")
    long countTechniciansByStatus(@Param("status") EmployeeStatus status);
}