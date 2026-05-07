package com.ipem.api.modules.vehicle.model;

import com.ipem.api.infrastructure.models.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLRestriction;

@Entity
@Table(name = "car_type")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@SQLRestriction("is_active = true")
public class CarType extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private String brand;
    private String model;
    private Integer year;

    @Column(name = "category", columnDefinition = "ENUM('passenger', 'utility')")
    private String category;

    @Column(name = "is_active", columnDefinition = "boolean default true")
    private Boolean isActive = true;
}