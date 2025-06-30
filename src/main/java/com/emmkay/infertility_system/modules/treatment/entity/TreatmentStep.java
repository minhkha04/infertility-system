package com.emmkay.infertility_system.modules.treatment.entity;

import com.emmkay.infertility_system.modules.appointment.entity.Appointment;
import com.emmkay.infertility_system.modules.treatment.enums.TreatmentStepStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDate;
import java.util.LinkedHashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "treatment_step")
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TreatmentStep {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "record_id", nullable = false)
    private TreatmentRecord record;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "stage_id", nullable = false)
    private TreatmentStage stage;

    @Size(max = 255)
    @NotNull
    @Column(name = "step_type", nullable = false)
    private String stepType;

    @Column(name = "scheduled_date")
    private LocalDate scheduledDate;

    @Column(name = "actual_date")
    private LocalDate actualDate;

    @Column(name = "status", length = 50)
    @Enumerated(EnumType.STRING)
    private TreatmentStepStatus status;

    @Lob
    @Column(name = "notes")
    private String notes;


    @OneToMany(mappedBy = "treatmentStep")
    private Set<Appointment> appointments = new LinkedHashSet<>();

}