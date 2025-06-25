package com.emmkay.infertility_system_api.modules.treatment.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.LinkedHashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "treatment_type")
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TreatmentType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Size(max = 100)
    @NotNull
    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Lob
    @Column(name = "description")
    private String description;

    @OneToMany(mappedBy = "type")
    private Set<TreatmentService> treatmentServices = new LinkedHashSet<>();

    @OneToMany(mappedBy = "type")
    private Set<TreatmentStage> treatmentStages = new LinkedHashSet<>();
}