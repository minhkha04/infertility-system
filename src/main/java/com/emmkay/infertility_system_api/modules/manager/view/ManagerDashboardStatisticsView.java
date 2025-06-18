package com.emmkay.infertility_system_api.modules.manager.view;

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
    private Long totalRevenue;

    @Column(name = "total_appointments")
    private Long totalAppointments;

    @Column(name = "total_customers_treated")
    private Long totalCustomersTreated;


}
