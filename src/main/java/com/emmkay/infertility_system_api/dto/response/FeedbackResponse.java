package com.emmkay.infertility_system_api.dto.response;

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
    String doctorId;
    int rating;
    String comment;
    LocalDate submitDate;
    boolean isApproved;
    String status;
    String note;
    String approvedBy;
    String recordId;
}
