package com.emmkay.infertility_system_api.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;
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
    private Integer id;

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

    @NotNull
    @Column(name = "scheduled_date", nullable = false)
    private LocalDate scheduledDate;

    @Column(name = "actual_date")
    private LocalDate actualDate;

    @ColumnDefault("'Planned'")
    @Lob
    @Column(name = "status")
    private String status;

    @Lob
    @Column(name = "notes")
    private String notes;

    @OneToMany(mappedBy = "step")
    private Set<Reminder> reminders = new LinkedHashSet<>();

}