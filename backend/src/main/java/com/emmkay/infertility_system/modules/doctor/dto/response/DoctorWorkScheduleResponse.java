package com.emmkay.infertility_system.modules.doctor.dto.response;

import com.emmkay.infertility_system.modules.shared.enums.Shift;
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
    Map<String, List<Shift>> schedules;
}
