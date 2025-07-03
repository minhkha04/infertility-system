package com.emmkay.infertility_system.modules.appointment.dto.request;

import com.emmkay.infertility_system.modules.shared.enums.Shift;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ChangeAppointmentByCustomerRequest {

    @NotNull(message = "{validation.required}")
    LocalDate requestedDate;

    @NotNull(message = "{validation.required}")
    Shift requestedShift;

    String notes;
}
