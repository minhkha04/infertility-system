package com.emmkay.infertility_system.modules.feedback.enums;

public enum FeedbackStatus {
    PENDING,
    APPROVED,
    REJECTED,
    HIDDEN,
    ;
    public static FeedbackStatus fromString(String status) {
        return FeedbackStatus.valueOf(status.toUpperCase());
    }
}
