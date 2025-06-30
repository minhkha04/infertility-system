package com.emmkay.infertility_system.modules.dashboard.view;

import com.google.errorprone.annotations.Immutable;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Immutable
@Table(name = "manager_revenue_overview")
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class ManagerRevenueOverview {

    @Id
    @Column(name = "total_customers_treated")
    private Long totalCustomersTreated;

    @Column(name = "total_revenue")
    private Long totalRevenue;

    @Column(name = "total_revenue_this_month")
    private Long totalRevenueThisMonth;
}
