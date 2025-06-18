package com.emmkay.infertility_system_api.modules.feedback.dto.request;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FeedbackUpdateRequest {
    @NotNull(message = "{validation.required}")
    int rating;
    @NotBlank(message = "{validation.required}")
    String comment;
    @NotNull(message = "{validation.required}")
    Long recordId;
}
