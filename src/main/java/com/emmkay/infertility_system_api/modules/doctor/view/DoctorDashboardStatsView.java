package com.emmkay.infertility_system_api.modules.doctor.view;

import com.google.errorprone.annotations.Immutable;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Immutable
@Table(name = "doctor_dashboard_stats_view")
public class DoctorDashboardStatsView {
    @Id
    @Column(name = "doctor_id")
    private String doctorId;

    @Column(name = "avg_rating")
    private Double avgRating;

    @Column(name = "patients")
    private Integer patients;

    @Column(name = "work_shifts_this_month")
    private Integer workShiftsThisMonth;
}
