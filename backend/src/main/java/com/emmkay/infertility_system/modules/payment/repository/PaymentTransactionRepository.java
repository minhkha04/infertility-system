package com.emmkay.infertility_system.modules.payment.repository;

import com.emmkay.infertility_system.modules.payment.entity.PaymentTransaction;
import com.emmkay.infertility_system.modules.payment.enums.PaymentStatus;
import com.emmkay.infertility_system.modules.payment.projection.PaymentInfoProjection;
import com.emmkay.infertility_system.modules.treatment.entity.TreatmentRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {

    Optional<PaymentTransaction> findByTransactionCode(String transactionCode);

    List<PaymentTransaction> findAllByStatusAndExpiredAtBefore(PaymentStatus status, LocalDateTime now);
    boolean existsByRecordAndStatus(TreatmentRecord record, PaymentStatus status);

    Optional<PaymentTransaction> findTopByRecordIdOrderByCreatedAtDesc(Long recordId);

    boolean existsByRecordIdAndStatus(Long recordId, PaymentStatus status);

    @Query("""
                    SELECT
                        tr.id AS recordId,
                        tr.customer.fullName AS customerName,
                        tr.doctor.users.fullName AS doctorName,
                        tr.service.name AS treatmentServiceName,
                        tr.service.price AS price,
                        ( CASE
                             WHEN EXISTS (
                                  SELECT 1
                                  FROM PaymentTransaction pt
                                  WHERE pt.record.id = tr.id AND pt.status = 'SUCCESS'
                             ) THEN true
                             ELSE false
                             END
                        ) AS isPaid,
                        tr.status AS recordStatus
                    FROM TreatmentRecord tr
                    WHERE tr.customer.id = :customerId
                """)
    Page<PaymentInfoProjection> searchPaymentInfo(String customerId, Pageable pageable);
}
