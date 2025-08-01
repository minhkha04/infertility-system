package com.emmkay.infertility_system.modules.treatment.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Getter
@Setter
@Entity
@Table(name = "treatment_step_lab_test")
public class TreatmentStepLabTest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "treatment_step_id", nullable = false)
    private TreatmentStep treatmentStep;

    @Size(max = 255)
    @NotNull
    @Column(name = "test_name", nullable = false)
    private String testName;

    @Column(name = "notes")
    private String notes;

    @Column(name = "result")
    private String result;

}