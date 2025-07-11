package com.emmkay.infertility_system.modules.schedule.dto.request;

import com.emmkay.infertility_system.modules.shared.enums.Shift;
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

    @NotNull(message = "{validation.required}")
    Shift shift;

    @NotNull(message = "{validation.required}")
    LocalDate workDate;
}
