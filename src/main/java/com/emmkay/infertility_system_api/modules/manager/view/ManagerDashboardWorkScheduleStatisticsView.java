package com.emmkay.infertility_system_api.modules.manager.view;

import com.google.errorprone.annotations.Immutable;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Immutable
@Table(name = "manager_work_schedule_tody")
public class ManagerDashboardWorkScheduleStatisticsView {
    @Id
    @Column(name = "total_doctors_today")
    private Integer totalDoctorsToday;

    @Column(name = "total_patients_today")
    private Integer totalPatientsToday;

    @Column(name = "completed_patients_today")
    private Integer completedPatientsToday;
}
