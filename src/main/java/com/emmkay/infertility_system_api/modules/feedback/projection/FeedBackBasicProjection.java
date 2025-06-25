package com.emmkay.infertility_system_api.modules.feedback.projection;

import java.time.LocalDateTime;

public interface FeedBackBasicProjection {
    Long getId();
    String getCustomerFullName();
    String getDoctorFullName();
    Integer getRating();
    String getComment();
    String getStatus();
    LocalDateTime getCreatedAt();
}
