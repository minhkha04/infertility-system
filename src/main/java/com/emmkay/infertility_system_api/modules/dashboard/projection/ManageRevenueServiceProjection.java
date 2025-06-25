package com.emmkay.infertility_system_api.modules.dashboard.projection;

public interface ManageRevenueServiceProjection {
    String getServiceName();
    Long getTotalRecords();
    Double getTotalSuccessfulPayments();
    Integer getTotalRevenue();
}

