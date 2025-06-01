package com.emmkay.infertility_system_api.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

import java.time.LocalDate;
import java.util.LinkedHashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "users")
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class User {
    @Id
    @Size(max = 36)
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, length = 36)
    private String id;

    @Size(max = 100)
    @NotNull
    @Column(name = "username", nullable = false, length = 100)
    private String username;

    @Size(max = 255)
    @NotNull
    @Column(name = "password", nullable = false)
    private String password;

    @Size(max = 255)
    @Column(name = "full_name")
    private String fullName;

    @Size(max = 255)
    @Column(name = "email")
    private String email;

    @Size(max = 20)
    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    @Size(max = 10)
    @Column(name = "gender", length = 10)
    private String gender;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "role_name", nullable = false)
    private Role roleName;

    @ColumnDefault("0")
    @Column(name = "is_removed")
    private Boolean isRemoved;

    @ColumnDefault("0")
    @Column(name = "is_verified")
    private Boolean isVerified;

    @Size(max = 255)
    @Column(name = "address")
    private String address;



    @OneToMany(mappedBy = "author")
    private Set<Blog> blogs = new LinkedHashSet<>();

    @OneToOne(mappedBy = "users")
    private Doctor doctor;

    @OneToMany(mappedBy = "customer")
    private Set<Feedback> feedbacksGiven = new LinkedHashSet<>();

    @OneToMany(mappedBy = "approvedBy")
    private Set<Feedback> feedbacksApproved = new LinkedHashSet<>();

    @OneToMany(mappedBy = "customer")
    private Set<Reminder> reminders = new LinkedHashSet<>();

    @OneToMany(mappedBy = "customer")
    private Set<TreatmentRecord> treatmentRecords = new LinkedHashSet<>();

    @OneToMany(mappedBy = "createdBy")
    private Set<TreatmentService> treatmentServices = new LinkedHashSet<>();

    @Size(max = 255)
    @Column(name = "avatar_url")
    private String avatarUrl;


    @OneToMany(mappedBy = "createdBy")
    private Set<WorkSchedule> workSchedules = new LinkedHashSet<>();

    @OneToMany(mappedBy = "customer")
    private Set<Appointment> appointments = new LinkedHashSet<>();

}