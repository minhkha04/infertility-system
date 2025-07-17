package com.emmkay.infertility_system.modules.treatment.enums;

public enum TreatmentStepStatus {
    CONFIRMED,
    COMPLETED,
    INPROGRESS,
    CANCELLED,
    ;
    public static TreatmentStepStatus fromString(String status) {
        return TreatmentStepStatus.valueOf(status.toUpperCase());
    }
}
