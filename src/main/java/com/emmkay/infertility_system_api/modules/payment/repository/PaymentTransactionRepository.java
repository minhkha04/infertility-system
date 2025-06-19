package com.emmkay.infertility_system_api.modules.payment.repository;

import com.emmkay.infertility_system_api.modules.payment.entity.PaymentTransaction;
import com.emmkay.infertility_system_api.modules.treatment.entity.TreatmentRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {
    Optional<PaymentTransaction> findByRecord(TreatmentRecord record);

    boolean existsByRecordAndStatusIn(TreatmentRecord record, Collection<String> statuses);

    Optional<PaymentTransaction> findByTransactionCode(String transactionCode);

    List<PaymentTransaction> findAllByStatusAndExpiredAtBefore(String pending, LocalDateTime now);

    Optional<PaymentTransaction> findByRecordIdAndStatus(Long recordId, String status);

    boolean existsByRecordAndStatus(TreatmentRecord record, String status);

    Optional<PaymentTransaction> findTopByRecordIdOrderByCreatedAtDesc(Long recordId);
}
