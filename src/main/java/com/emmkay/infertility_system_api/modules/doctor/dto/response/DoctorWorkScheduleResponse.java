package com.emmkay.infertility_system_api.modules.doctor.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DoctorWorkScheduleResponse {
    String doctorId;
    String from;
    Map<String, List<String>> schedules;
}
