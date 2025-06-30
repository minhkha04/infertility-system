package com.emmkay.infertility_system_api.modules.payment.projection;

public interface PaymentInfoProjection {
    Long getRecordId();
    String getCustomerName();
    String getDoctorName();
    Boolean getIsPaid();
    String getTreatmentServiceName();
    Double getPrice();
    String getRecordStatus();
}
