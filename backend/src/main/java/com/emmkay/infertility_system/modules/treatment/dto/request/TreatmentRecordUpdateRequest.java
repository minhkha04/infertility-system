package com.emmkay.infertility_system.modules.treatment.dto.request;


import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TreatmentRecordUpdateRequest {

    @NotNull(message = "{validation.required}")
    long serviceId;

}
