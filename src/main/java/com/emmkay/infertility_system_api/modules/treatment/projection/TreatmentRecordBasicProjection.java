package com.emmkay.infertility_system_api.modules.treatment.projection;

import java.time.LocalDate;

public interface TreatmentRecordBasicProjection {
    Long getId();
    String getCustomerName();
    String getDoctorName();
    String getStatus();
    Integer getTotalSteps();
    Integer getCompletedSteps();
    LocalDate getStartDate();
    String getServiceName();
    Boolean getIsPaid();
}
