package com.emmkay.infertility_system_api.modules.schedule.dto.response;

import com.emmkay.infertility_system_api.modules.shared.enums.Shift;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class WorkScheduleResponse {
    Long id;
    String doctorId;
    LocalDate workDate;
    Shift shift;
    LocalDateTime createdAt;
    String createdBy;
}
