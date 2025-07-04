package com.emmkay.infertility_system.modules.treatment.enums;

public enum TreatmentRecordStatus {
    CONFIRMED,
    INPROGRESS,
    COMPLETED,
    CANCELLED,
    ;
    public static TreatmentRecordStatus fromString(String status) {
        return TreatmentRecordStatus.valueOf(status.toUpperCase());
    }
}
