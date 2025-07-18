package com.emmkay.infertility_system.modules.dashboard.view;

import com.google.errorprone.annotations.Immutable;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Immutable
@Table(name = "manager_work_statistics_today_view")
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ManagerWorkStatisticsTodayView {
    @Id
    @Column(name = "id")
    private Integer id;

    @Column(name = "total_doctors_today")
    private Integer totalDoctorsToday;

    @Column(name = "total_patients_today")
    private Integer totalPatientsToday;

    @Column(name = "completed_patients_today")
    private Integer completedPatientsToday;

}
