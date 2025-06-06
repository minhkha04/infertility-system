package com.emmkay.infertility_system_api.view;

import com.google.errorprone.annotations.Immutable;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Immutable
@Table(name = "manager_dashboard_stats_view")
public class ManagerDashboardStatisticsView {
    @Id
    @Column(name = "total_revenue")
    private int totalRevenue;

    @Column(name = "total_appointments")
    private int totalAppointments;

    @Column(name = "total_customers_treated")
    private int totalCustomersTreated;


}
