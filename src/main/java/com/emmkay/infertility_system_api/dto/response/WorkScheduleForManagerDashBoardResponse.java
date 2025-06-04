package com.emmkay.infertility_system_api.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class WorkScheduleForManagerDashBoardResponse {
    String doctorName;
    String doctorId;
    String shift;
    String phoneNumber;
    int totalAppointments;
    int completedAppointments;
}
