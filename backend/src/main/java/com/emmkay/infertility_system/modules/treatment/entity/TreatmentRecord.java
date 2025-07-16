package com.emmkay.infertility_system.modules.treatment.entity;

import com.emmkay.infertility_system.modules.treatment.enums.TreatmentRecordResult;
import com.emmkay.infertility_system.modules.treatment.enums.TreatmentRecordStatus;
import com.emmkay.infertility_system.modules.user.entity.User;
import com.emmkay.infertility_system.modules.doctor.entity.Doctor;
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
@Table(name = "treatment_record")
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TreatmentRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @OnDelete(action = OnDeleteAction.SET_NULL)
    @JoinColumn(name = "doctor_id")
    private Doctor doctor;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "service_id", nullable = false)
    private TreatmentService service;

    @NotNull
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private TreatmentRecordStatus status;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "created_date")
    private LocalDate createdDate;

    @OneToMany(mappedBy = "record")
    private Set<TreatmentStep> treatmentSteps = new LinkedHashSet<>();

    @Column(name = "cd1_date")
    private LocalDate cd1Date;

    @Column(name = "result")
    @Enumerated(EnumType.STRING)
    private TreatmentRecordResult result;
}