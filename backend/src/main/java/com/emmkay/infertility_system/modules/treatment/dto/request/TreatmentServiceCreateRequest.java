package com.emmkay.infertility_system.modules.treatment.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TreatmentServiceCreateRequest {

    @NotBlank(message = "{validation.required}")
    String name;

    String description;

    @NotNull(message = "{validation.required}")
    @Min(value = 0, message = "{validation.min}")
    double  price;

    @NotNull(message = "{validation.required}")
    @Min(value = 1, message = "{validation.min}")
    int duration;

    @NotEmpty
    @Valid
    List<TreatmentStageCreateRequest> treatmentStages;
}
