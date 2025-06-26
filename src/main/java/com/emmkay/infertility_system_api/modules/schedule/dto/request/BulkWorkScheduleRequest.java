package com.emmkay.infertility_system_api.modules.schedule.dto.request;

import com.emmkay.infertility_system_api.modules.shared.enums.Shift;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BulkWorkScheduleRequest {
    @NotBlank(message = "{validation.required}")
    String doctorId;
    @NotBlank(message = "{validation.required}")
    String month; // yyyy-MM
    @Valid
    List<ShiftRule> rules;
    String createdBy;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class ShiftRule {
        @NotBlank(message = "{validation.required}")
        String weekday; // MONDAY, TUESDAY, ...
        @NotBlank(message = "{validation.required}")
        Shift shift;   // morning, afternoon, full_day
    }
}
