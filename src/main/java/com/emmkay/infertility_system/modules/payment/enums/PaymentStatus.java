package com.emmkay.infertility_system.modules.payment.enums;

public enum PaymentStatus {
    PENDING,
    SUCCESS,
    FAILED,
    ;

    public static PaymentStatus fromString(String status) {
        return PaymentStatus.valueOf(status.toUpperCase());
    }
}
