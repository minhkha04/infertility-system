package com.emmkay.infertility_system.modules.feedback.dto.request;

import com.emmkay.infertility_system.modules.feedback.enums.FeedbackStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FeedbackUpdateStatusRequest {
    String note;
    @NotNull(message = "{validation.required}")
    FeedbackStatus status;
}
