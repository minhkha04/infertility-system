package com.emmkay.infertility_system_api.modules.schedule.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class WorkScheduleUpdateRequest {

    @NotBlank(message = "{validation.required}")
    String shift;

    @NotNull(message = "{validation.required}")
    LocalDate workDate;
}
