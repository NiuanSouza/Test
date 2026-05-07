package com.ipem.api.modules.service.model;

import com.ipem.api.infrastructure.models.BaseEntity;
import com.ipem.api.modules.service.model.enums.IncidentType;
import com.ipem.api.modules.service.model.enums.Severity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDateTime;

@Entity
@Table(name = "incidents")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@SQLRestriction("is_active = true")
public class Incident extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "service_id", nullable = false)
    private Service service;

    @Enumerated(EnumType.STRING)
    private IncidentType incidentType;

    private String location;
    private Boolean requestSupport;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_active", columnDefinition = "boolean default true")
    private Boolean isActive = true;

    @Enumerated(EnumType.STRING)
    private Severity severity;
    private Boolean resolved = false;
    private LocalDateTime resolvedAt;
}