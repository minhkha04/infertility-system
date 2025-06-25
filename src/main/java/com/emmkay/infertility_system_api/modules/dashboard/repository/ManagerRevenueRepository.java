package com.emmkay.infertility_system_api.modules.dashboard.repository;

import com.emmkay.infertility_system_api.modules.dashboard.projection.ManageRevenueServiceProjection;
import com.emmkay.infertility_system_api.modules.dashboard.view.ManagerRevenueOverview;
import com.emmkay.infertility_system_api.modules.dashboard.projection.ManagerRevenueChartProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ManagerRevenueRepository extends JpaRepository<ManagerRevenueOverview, Long> {

    @Query(value = """
                SELECT
                    ts.name AS serviceName,
                    COUNT(DISTINCT tr.id) AS totalRecords,
                    COUNT(pt.id) AS totalSuccessfulPayments,
                    SUM(pt.amount) AS totalRevenue
                FROM TreatmentService  ts
                LEFT JOIN TreatmentRecord tr ON ts.id = tr.service.id AND tr.status != 'CANCELLED'
                LEFT JOIN PaymentTransaction pt ON pt.record.id = tr.id AND pt.status = 'SUCCESS'
                GROUP BY ts.id, ts.name
            """)
    List<ManageRevenueServiceProjection> getManagerRevenueService();

    @Query("""
                SELECT
                    FUNCTION('DATE_FORMAT', pt.createdAt, '%Y-%m') AS month,
                    SUM(pt.amount) AS totalRevenue
                FROM PaymentTransaction pt
                WHERE pt.status = 'SUCCESS'
                    AND pt.createdAt >= :fromDate
                    AND pt.createdAt < :toDate
                GROUP BY FUNCTION('DATE_FORMAT', pt.createdAt, '%Y-%m')
                ORDER BY FUNCTION('DATE_FORMAT', pt.createdAt, '%Y-%m') ASC
            """)
    List<ManagerRevenueChartProjection> getManagerDashboardChartProject(
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate
    );
}
