package com.emmkay.infertility_system.modules.dashboard.projection;

public interface ManageRevenueServiceProjection {
    String getServiceName();
    Long getTotalRecords();
    Double getTotalSuccessfulPayments();
    Integer getTotalRevenue();
}

