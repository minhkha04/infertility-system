package com.emmkay.infertility_system.modules.doctor.entity;

import com.emmkay.infertility_system.modules.feedback.entity.Feedback;
import com.emmkay.infertility_system.modules.treatment.entity.TreatmentRecord;
import com.emmkay.infertility_system.modules.user.entity.User;
import com.emmkay.infertility_system.modules.schedule.entity.WorkSchedule;
import com.emmkay.infertility_system.modules.appointment.entity.Appointment;
import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.util.LinkedHashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "doctors")
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Doctor {
    @Id
    @Size(max = 36)
    @Column(name = "id", nullable = false, length = 36)
    private String id;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "id", nullable = false)
    private User users;


    @Lob
    @Column(name = "qualifications")
    private String qualifications;

    @Column(name = "graduation_year")
    private Integer graduationYear;

    @Column(name = "experience_years")
    private Integer experienceYears;

    @OneToMany(mappedBy = "doctor")
    private Set<Feedback> feedbacks = new LinkedHashSet<>();

    @OneToMany(mappedBy = "doctor")
    private Set<TreatmentRecord> treatmentRecords = new LinkedHashSet<>();

    @OneToMany(mappedBy = "doctor")
    private Set<WorkSchedule> workSchedules = new LinkedHashSet<>();

    @OneToMany(mappedBy = "doctor")
    private Set<Appointment> appointments = new LinkedHashSet<>();

    @Size(max = 255)
    @Column(name = "specialty")
    private String specialty;

    @ColumnDefault("0")
    @Column(name = "is_public")
    private Boolean isPublic;

}