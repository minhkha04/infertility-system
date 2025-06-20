package com.emmkay.infertility_system_api.modules.treatment.repository;

import com.emmkay.infertility_system_api.modules.manager.projection.ManagerDashboardChartProject;
import com.emmkay.infertility_system_api.modules.manager.projection.ManagerDashboardServiceProjection;
import com.emmkay.infertility_system_api.modules.treatment.entity.TreatmentService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TreatmentServiceRepository extends JpaRepository<TreatmentService, Long> {
    boolean existsByName(String name);

    boolean existsByNameAndIdNot(String name, Long id);

    List<TreatmentService> findAllByIsRemoveFalse();

    Optional<TreatmentService> getTreatmentServicesById(Long id);

    @Query(value = """
                SELECT
                    ts.id AS typeId,
                    SUM(ts.price) AS totalRevenue,
                    ts.name AS name,
                    COUNT(DISTINCT tr.id) AS totalUses
                FROM TreatmentRecord tr
                JOIN TreatmentService ts ON tr.service.id = ts.id
                WHERE tr.status IN ('COMPLETED', 'INPROGRESS')
                  AND EXISTS (
                    SELECT 1 FROM PaymentTransaction pt
                    WHERE pt.record.id = tr.id AND pt.status = 'SUCCESS'
                  )
                GROUP BY ts.id, ts.name
                ORDER BY totalRevenue DESC
            """)
    List<ManagerDashboardServiceProjection> getManagerDashboardServices();

    @Query("""
                SELECT
                    FUNCTION('DATE_FORMAT', tr.startDate, '%Y-%m') AS month,
                    SUM(ts.price) AS totalRevenue,
                    COUNT(DISTINCT tr.id) AS totalTreatmentServiceInMonth
                FROM TreatmentRecord tr
                JOIN tr.service ts
                JOIN PaymentTransaction pt ON pt.record.id = tr.id AND pt.status = 'SUCCESS'
                WHERE tr.status != 'CANCELLED'
                  AND tr.startDate >= :fromDate
                  AND tr.startDate < :toDate
                GROUP BY FUNCTION('DATE_FORMAT', tr.startDate, '%Y-%m')
                ORDER BY month ASC
            """)
    List<ManagerDashboardChartProject> getManagerDashboardChartProject(
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate
    );
}
