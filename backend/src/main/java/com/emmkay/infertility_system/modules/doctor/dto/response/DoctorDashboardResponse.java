package com.emmkay.infertility_system.modules.doctor.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DoctorDashboardResponse {
    double avgRating;
    int patients;
    int workShiftsThisMonth;
}
