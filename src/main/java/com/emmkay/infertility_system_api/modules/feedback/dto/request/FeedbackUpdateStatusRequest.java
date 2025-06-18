package com.emmkay.infertility_system_api.modules.feedback.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FeedbackUpdateStatusRequest {
    boolean isApproved;
    String approveBy;
    String note;
    String status;
}
