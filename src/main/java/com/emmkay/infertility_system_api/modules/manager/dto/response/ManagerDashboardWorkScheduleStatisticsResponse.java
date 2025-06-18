package com.emmkay.infertility_system_api.modules.manager.dto.response;


import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ManagerDashboardWorkScheduleStatisticsResponse {
     Integer totalDoctorsToday;
     Integer totalPatientsToday;
     Integer completedPatientsToday;
}
