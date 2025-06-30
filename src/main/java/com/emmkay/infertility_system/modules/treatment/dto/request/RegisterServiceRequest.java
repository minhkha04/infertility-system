package com.emmkay.infertility_system.modules.treatment.dto.request;

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
public class RegisterServiceRequest {

    String doctorId;

    @NotNull(message = "{validation.required}")
    Long treatmentServiceId;

    @NotNull(message = "{validation.required}")
    LocalDate startDate;

    @NotNull(message = "{validation.required}")
    Shift shift;

    LocalDate cd1Date;

}
