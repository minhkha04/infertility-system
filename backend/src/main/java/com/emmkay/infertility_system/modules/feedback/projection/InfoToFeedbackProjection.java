package com.emmkay.infertility_system.modules.feedback.projection;

public interface InfoToFeedbackProjection {
    String getDoctorId();
    String getCustomerId();
    String getServiceId();
    String getServiceName();
    String getDoctorFullName();
}
