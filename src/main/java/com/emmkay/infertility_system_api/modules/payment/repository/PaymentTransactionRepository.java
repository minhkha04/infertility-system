package com.emmkay.infertility_system_api.modules.payment.repository;

import com.emmkay.infertility_system_api.modules.payment.entity.PaymentTransaction;
import com.emmkay.infertility_system_api.modules.payment.enums.PaymentStatus;
import com.emmkay.infertility_system_api.modules.treatment.entity.TreatmentRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {

    boolean existsByRecordAndStatusIn(TreatmentRecord record, Collection<PaymentStatus> statuses);

    Optional<PaymentTransaction> findByTransactionCode(String transactionCode);

    List<PaymentTransaction> findAllByStatusAndExpiredAtBefore(PaymentStatus status, LocalDateTime now);
    boolean existsByRecordAndStatus(TreatmentRecord record, PaymentStatus status);

    Optional<PaymentTransaction> findTopByRecordIdOrderByCreatedAtDesc(Long recordId);

    boolean existsByRecordIdAndStatus(Long recordId, PaymentStatus status);
}
