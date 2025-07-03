package com.emmkay.infertility_system.modules.treatment.projection;

import com.emmkay.infertility_system.modules.treatment.enums.TreatmentRecordStatus;

import java.time.LocalDate;

public interface TreatmentRecordBasicProjection {
    long getId();
    String getCustomerName();
    String getDoctorName();
    TreatmentRecordStatus getStatus();
    int getTotalSteps();
    int getCompletedSteps();
    LocalDate getStartDate();
    String getServiceName();
    boolean getIsPaid();
}
