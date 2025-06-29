package com.emmkay.infertility_system_api.modules.appointment.dto.request;

import com.emmkay.infertility_system_api.modules.shared.enums.Shift;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ChangeAppointmentByDoctorOrManagerRequest {

    @NotNull(message = "{validation.required}")
    LocalDate appointmentDate;
    @NotNull(message = "{validation.required}")
    Shift shift;

    String notes;
}
