package com.emmkay.infertility_system_api.modules.treatment.repository;

import com.emmkay.infertility_system_api.modules.treatment.entity.TreatmentRecord;
import com.emmkay.infertility_system_api.modules.treatment.projection.TreatmentRecordBasicProjection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;


@Repository
public interface TreatmentRecordRepository extends JpaRepository<TreatmentRecord, Long> {

    @Query("""
                 SELECT
                    tr.id AS id,
                    tr.customer.fullName AS customerName,
                    tr.doctor.users.fullName AS doctorName,
                    SIZE(tr.treatmentSteps) AS totalSteps,
                    tr.startDate AS startDate,
                    (
                        SELECT COUNT(ts)
                        FROM TreatmentStep ts
                        WHERE ts.record.id = tr.id
                            AND ts.status = 'COMPLETED'
                    ) AS completedSteps,
                    tr.status AS status,
                    tr.service.name AS serviceName,
                    (
                                CASE
                                    WHEN EXISTS (
                                        SELECT 1
                                        FROM PaymentTransaction pt
                                        WHERE pt.record.id = tr.id AND pt.status = 'SUCCESS'
                                    ) THEN true
                                    ELSE false
                                END
                            ) AS isPaid
                  FROM TreatmentRecord tr
                  WHERE (:customerId IS NULL OR tr.customer.id = :customerId)
                    AND (:doctorId IS NULL OR tr.doctor.id = :doctorId)
                    AND (:status IS NULL OR tr.status = :status)
            """)
    Page<TreatmentRecordBasicProjection> searchTreatmentRecords(String customerId, String doctorId, String status, Pageable pageable);

}
