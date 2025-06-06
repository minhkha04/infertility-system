package com.emmkay.infertility_system_api.dto.response;


import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ManagerDashboardWorkScheduleStaticsResponse {
     int totalDoctorsToday;
     Integer totalPatientsToday;
     Integer completedPatientsToday;
}
