package com.emmkay.infertility_system.modules.appointment.enums;

public enum AppointmentStatus {
    CONFIRMED,
    COMPLETED,
    CANCELLED,
    PENDING_CHANGE,
    REJECTED
    ;
    public static AppointmentStatus from(String value) {
        return AppointmentStatus.valueOf(value.toUpperCase());
    }
}
