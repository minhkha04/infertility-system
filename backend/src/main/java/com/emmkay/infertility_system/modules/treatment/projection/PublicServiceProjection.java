package com.emmkay.infertility_system.modules.treatment.projection;

public interface PublicServiceProjection {
    long getServiceId();
    String getServiceName();
    String getCoverImageUrl();
    double getPrice();
    int getDuration();
    String getDescription();
}
