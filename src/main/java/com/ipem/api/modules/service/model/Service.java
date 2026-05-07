package com.ipem.api.modules.service.model;

import com.ipem.api.infrastructure.models.BaseEntity;
import com.ipem.api.modules.service.model.enums.Priority;
import com.ipem.api.modules.user.model.User;
import com.ipem.api.modules.vehicle.model.Car;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLRestriction;
import org.hibernate.envers.Audited;
import org.hibernate.envers.RelationTargetAuditMode; // <-- NOVA IMPORTAÇÃO AQUI

import java.time.LocalDateTime;

@Entity
@Table(name = "service")
@Audited
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@SQLRestriction("is_active = true")
public class Service extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "car_prefix")
    @Audited(targetAuditMode = RelationTargetAuditMode.NOT_AUDITED)
    private Car car;

    @ManyToOne
    @JoinColumn(name = "user_registration")
    @Audited(targetAuditMode = RelationTargetAuditMode.NOT_AUDITED)
    private User user;

    private LocalDateTime departureTime;
    private LocalDateTime arrivalTime;
    private LocalDateTime completionTime;

    private Float departureKm;
    private Float arrivalKm;
    private String destinationRequester;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_active", columnDefinition = "boolean default true")
    private Boolean isActive = true;

    private LocalDateTime expectedCompletionTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority")
    private Priority priority;
}