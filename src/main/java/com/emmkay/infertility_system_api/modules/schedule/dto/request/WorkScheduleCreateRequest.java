package com.emmkay.infertility_system_api.modules.schedule.dto.request;

import com.emmkay.infertility_system_api.modules.shared.enums.Shift;
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
public class WorkScheduleCreateRequest {
    @NotBlank(message = "{validation.required}")
    String doctorId;
    @NotNull(message = "{validation.required}")
    LocalDate workDate;
    @NotNull(message = "{validation.required}")
    Shift shift;
    @NotNull(message = "{validation.required}")
    String createdBy;
}
