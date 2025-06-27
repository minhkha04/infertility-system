package com.emmkay.infertility_system_api.modules.treatment.projection;

public interface TreatmentServiceBasicProjection {
    Long getId();
    String getName();
    Double getPrice();
    Integer getDuration();
    Boolean getIsRemove();
    String getCoverImageUrl();
    String getDescription();
}
