package com.emmkay.infertility_system_api.modules.treatment.enums;

public enum TreatmentRecordStatus {
    INPROGRESS,
    COMPLETED,
    CANCELLED,
    ;
    public static TreatmentRecordStatus fromString(String status) {
        return TreatmentRecordStatus.valueOf(status.toUpperCase());
    }
}
