package com.emmkay.infertility_system_api.modules.treatment.repository;

import com.emmkay.infertility_system_api.modules.manager.projection.ManagerDashboardStatisticsProjection;
import com.emmkay.infertility_system_api.modules.treatment.entity.TreatmentRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface TreatmentRecordRepository extends JpaRepository<TreatmentRecord, Long> {

    boolean existsByCustomerIdAndStatusIn(String customerId, Collection<String> statuses);

    Optional<TreatmentRecord> findByIdAndCustomerId(Long id, String customerId);

    List<TreatmentRecord> findByCustomerId(String customerId);

    List<TreatmentRecord> findByDoctorId(String doctorId);

    @Query(value = """
                    SELECT
                        x.totalRevenue AS totalRevenue,
                        x.totalAppointments AS totalAppointments,
                        x.totalCustomersTreated AS totalCustomersTreated
                    FROM ManagerDashboardStatisticsView AS x
            """)
    ManagerDashboardStatisticsProjection getManagerDashboardStatistics();

    @Query("SELECT tr.isPaid FROM TreatmentRecord tr WHERE tr.id = :recordId")
    Boolean findIsPaidById(@Param("recordId") Long recordId);
}
