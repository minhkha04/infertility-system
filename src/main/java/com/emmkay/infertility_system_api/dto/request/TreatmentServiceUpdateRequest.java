package com.emmkay.infertility_system_api.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TreatmentServiceUpdateRequest {

    @NotBlank(message = "{validation.required}")
    String name;

    String description;

    @NotNull(message = "{validation.required}")
    @Min(value = 0, message = "{validation.min}")
    double  price;

    @NotNull(message = "{validation.required}")
    @Min(value = 1, message = "{validation.min}")
    int duration;

    @NotNull(message = "{validation.required}")
    int treatmentTypeId;

}
