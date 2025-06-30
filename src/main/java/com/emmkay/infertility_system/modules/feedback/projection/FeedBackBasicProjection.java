package com.emmkay.infertility_system.modules.feedback.projection;

import com.emmkay.infertility_system.modules.feedback.enums.FeedbackStatus;

import java.time.LocalDateTime;

public interface FeedBackBasicProjection {
    Long getId();
    String getCustomerFullName();
    String getDoctorFullName();
    Integer getRating();
    String getComment();
    FeedbackStatus getStatus();
    LocalDateTime getCreatedAt();
}
