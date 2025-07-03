package com.emmkay.infertility_system.modules.feedback.projection;

import java.time.LocalDate;

public interface PublicFeedbackProjection {
    String getCustomerFullName();
    Integer getRating();
    String getComment();
    String getCustomerAvatar();
    LocalDate getCreatedAt();
}
