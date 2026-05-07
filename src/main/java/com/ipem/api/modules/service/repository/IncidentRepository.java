package com.ipem.api.modules.service.repository;

import com.ipem.api.modules.service.model.Incident;
import com.ipem.api.modules.service.model.enums.IncidentType;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface IncidentRepository extends JpaRepository<Incident, Long> {

    List<Incident> findByIncidentTypeAndIsActiveTrue(IncidentType type);

    List<Incident> findByRequestSupportTrueAndIsActiveTrue();
}