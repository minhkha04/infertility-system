package com.emmkay.infertility_system.modules.treatment.projection;

public interface TreatmentServiceBasicProjection {
    long getId();
    String getName();
    double getPrice();
    int getDuration();
    boolean getIsRemove();
    String getCoverImageUrl();
    String getDescription();
}
