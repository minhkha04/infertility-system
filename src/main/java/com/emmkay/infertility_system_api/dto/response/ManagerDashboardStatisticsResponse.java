package com.emmkay.infertility_system_api.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ManagerDashboardStatisticsResponse {
    int totalRevenue;
    int totalAppointments;
    int totalCustomersTreated;
}
