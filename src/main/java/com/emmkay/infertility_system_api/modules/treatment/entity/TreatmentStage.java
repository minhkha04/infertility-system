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
@Table(name = "treatment_stage")
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TreatmentStage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "type_id", nullable = false)
    private TreatmentType type;

    @Size(max = 255)
    @NotNull
    @Column(name = "name", nullable = false)
    private String name;

    @Lob
    @Column(name = "description")
    private String description;

    @Size(max = 50)
    @Column(name = "expected_day_range", length = 50)
    private String expectedDayRange;

    @NotNull
    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;

    @OneToMany(mappedBy = "stage")
    private Set<TreatmentStep> treatmentSteps = new LinkedHashSet<>();

}