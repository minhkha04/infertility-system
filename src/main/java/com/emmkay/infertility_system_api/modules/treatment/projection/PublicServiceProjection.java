package com.emmkay.infertility_system_api.modules.treatment.projection;

public interface PublicServiceProjection {
    Long getServiceId();
    String getServiceName();
    String getCoverImageUrl();
    Double getPrice();
    String getTypeName();
    Long getTypeId();
    Integer getDuration();
    String getDescription();
}
