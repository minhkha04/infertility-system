package com.emmkay.infertility_system_api.modules.treatment.dto.request;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TreatmentStageUpdateRequest {

    @NotBlank(message = "{validation.required}")
    Integer typeId;

    @NotBlank(message = "{validation.required}")
    @Size(max = 255, message = "{validation.size}")
    String name;

    @NotBlank(message = "{validation.required}")
    String description;

    @Size(max = 50, message = "{validation.size}")
    String expectedDayRange;

    @NotNull(message = "{validation.required}")
    Integer orderIndex;
}
