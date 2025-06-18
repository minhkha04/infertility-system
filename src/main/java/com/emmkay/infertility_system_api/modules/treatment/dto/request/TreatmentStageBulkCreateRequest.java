package com.emmkay.infertility_system_api.modules.treatment.dto.request;

import jakarta.validation.Valid;
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
public class TreatmentStageBulkCreateRequest {
    @NotNull(message = "{validation.required}")
    Integer typeId;

    @NotEmpty
    @Valid
    List<TreatmentStageCreateRequest> treatmentStages;
}
