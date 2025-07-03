package com.emmkay.infertility_system.modules.treatment.enums;

public enum TreatmentStepStatus {
    CONFIRMED,
    COMPLETED,
    CANCELLED,
    ;
    public static TreatmentStepStatus fromString(String status) {
        return TreatmentStepStatus.valueOf(status.toUpperCase());
    }
}
