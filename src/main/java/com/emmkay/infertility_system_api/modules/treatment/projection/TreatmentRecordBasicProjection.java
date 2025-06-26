package com.emmkay.infertility_system_api.modules.treatment.projection;

import com.emmkay.infertility_system_api.modules.treatment.enums.TreatmentRecordStatus;

import java.time.LocalDate;

public interface TreatmentRecordBasicProjection {
    Long getId();
    String getCustomerName();
    String getDoctorName();
    TreatmentRecordStatus getStatus();
    Integer getTotalSteps();
    Integer getCompletedSteps();
    LocalDate getStartDate();
    String getServiceName();
    Boolean getIsPaid();
}
