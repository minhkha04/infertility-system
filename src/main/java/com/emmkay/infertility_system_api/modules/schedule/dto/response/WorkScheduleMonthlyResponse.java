package com.emmkay.infertility_system_api.modules.schedule.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class WorkScheduleMonthlyResponse {
    private String doctorId;
    private String month;
    private Map<String, String> schedules;


}
