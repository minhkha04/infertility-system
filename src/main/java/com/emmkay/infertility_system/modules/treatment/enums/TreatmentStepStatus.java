package com.emmkay.infertility_system.modules.treatment.enums;

public enum TreatmentStepStatus {
    PLANNED,
    CONFIRMED,
    COMPLETED,
    CANCELLED,
    ;
    public static TreatmentStepStatus fromString(String status) {
        return TreatmentStepStatus.valueOf(status.toUpperCase());
    }
}
