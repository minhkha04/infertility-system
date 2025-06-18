package com.emmkay.infertility_system_api.modules.treatment.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TreatmentTypeCreateRequest {

    @NotBlank(message = "{validation.required}")
    @Size(max = 100, message = "{validation.size}")
    String name;

    @NotBlank(message = "{validation.required}")
    @Size(max = 100, message = "{validation.size}")
    String description;
}
