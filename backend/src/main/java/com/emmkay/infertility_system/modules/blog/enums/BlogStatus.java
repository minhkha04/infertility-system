package com.emmkay.infertility_system.modules.blog.enums;

public enum BlogStatus {
    DRAFT,
    PENDING_REVIEW,
    APPROVED,
    REJECTED,
    HIDDEN,
    ;

    public static BlogStatus fromString(String status) {
        return BlogStatus.valueOf(status.toUpperCase());
    }

}
