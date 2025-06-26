package com.emmkay.infertility_system_api.modules.feedback.dto.response;

import com.emmkay.infertility_system_api.modules.feedback.enums.FeedbackStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FeedbackResponse {

    Long id;
    String customerName;
    String doctorName;
    int rating;
    String comment;
    LocalDate submitDate;
    boolean isApproved;
    FeedbackStatus status;
    String note;
    String approvedBy;
    String recordId;
}
