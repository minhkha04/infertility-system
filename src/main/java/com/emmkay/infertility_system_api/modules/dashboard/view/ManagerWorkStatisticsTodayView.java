package com.emmkay.infertility_system_api.modules.dashboard.view;

import com.google.errorprone.annotations.Immutable;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Immutable
@Table(name = "manager_work_statistics_today_view")
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ManagerWorkStatisticsTodayView {
    @Id
    @Column(name = "total_doctors_today")
    private Integer totalDoctorsToday;

    @Column(name = "total_patients_today")
    private Integer totalPatientsToday;

    @Column(name = "completed_patients_today")
    private Integer completedPatientsToday;

}
