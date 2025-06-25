package com.emmkay.infertility_system_api.modules.appointment.entity;

import com.emmkay.infertility_system_api.modules.doctor.entity.Doctor;
import com.emmkay.infertility_system_api.modules.reminder.entity.Reminder;
import com.emmkay.infertility_system_api.modules.treatment.entity.TreatmentStep;
import com.emmkay.infertility_system_api.modules.user.entity.User;
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
@Table(name = "appointment")
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Appointment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @NotNull
    @Column(name = "appointment_date", nullable = false)
    private LocalDate appointmentDate;

    @Size(max = 20)
    @NotNull
    @Column(name = "shift", nullable = false, length = 20)
    private String shift;

    @ManyToOne(fetch = FetchType.LAZY)
    @OnDelete(action = OnDeleteAction.SET_NULL)
    @JoinColumn(name = "treatment_step_id")
    private TreatmentStep treatmentStep;

    @Size(max = 50)
    @Column(name = "status", length = 50)
    private String status;

    @Lob
    @Column(name = "notes")
    private String notes;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "created_at")
    private LocalDate createdAt;

    @Column(name = "requested_date")
    private LocalDate requestedDate;

    @Size(max = 20)
    @Column(name = "requested_shift", length = 20)
    private String requestedShift;

    @OneToMany(mappedBy = "appointment")
    private Set<Reminder> reminders = new LinkedHashSet<>();
}