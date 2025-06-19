package com.emmkay.infertility_system_api.modules.payment.service;

import com.emmkay.infertility_system_api.modules.payment.entity.PaymentTransaction;
import com.emmkay.infertility_system_api.modules.payment.helper.PaymentHelper;
import com.emmkay.infertility_system_api.modules.payment.repository.PaymentTransactionRepository;
import com.emmkay.infertility_system_api.modules.shared.exception.AppException;
import com.emmkay.infertility_system_api.modules.shared.exception.ErrorCode;
import com.emmkay.infertility_system_api.modules.treatment.entity.TreatmentRecord;
import com.emmkay.infertility_system_api.modules.treatment.repository.TreatmentRecordRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class PaymentTransactionService {

    TreatmentRecordRepository treatmentRecordRepository;
    PaymentTransactionRepository paymentTransactionRepository;
    PaymentHelper paymentHelper;

    public TreatmentRecord isAvailable(Long recordId, boolean isReload) {
        TreatmentRecord treatmentRecord = treatmentRecordRepository.findById(recordId)
                .orElseThrow(() -> new AppException(ErrorCode.TREATMENT_RECORD_NOT_FOUND));

        if (treatmentRecord.getStatus().equalsIgnoreCase("CANCELLED")) {
            throw new AppException(ErrorCode.CANNOT_PAY);
        }

        if (isReload) {
            boolean hasSuccess = paymentTransactionRepository.existsByRecordAndStatus(treatmentRecord, "SUCCESS");
            if (hasSuccess) {
                throw new AppException(ErrorCode.CANNOT_PAY);
            }
        } else {
            boolean hasActiveTransaction = paymentTransactionRepository.existsByRecordAndStatusIn(treatmentRecord, List.of("PENDING", "SUCCESS"));
            if (hasActiveTransaction) {
                throw new AppException(ErrorCode.CANNOT_PAY);
            }
        }
        return treatmentRecord;
    }

    public PaymentTransaction createTransaction(TreatmentRecord treatmentRecord, String paymentMethod, long expirationMinutes) {
        PaymentTransaction paymentTransaction = PaymentTransaction.builder()
                .transactionCode(paymentHelper.getOrderId(treatmentRecord.getId()))
                .record(treatmentRecord)
                .status("PENDING")
                .amount(treatmentRecord.getService().getPrice())
                .paymentMethod(paymentMethod)
                .createdAt(LocalDateTime.now())
                .expiredAt(LocalDateTime.now().plusMinutes(expirationMinutes))
                .customer(treatmentRecord.getCustomer())
                .build();
        return paymentTransactionRepository.save(paymentTransaction);
    }

    public PaymentTransaction reloadTransaction(TreatmentRecord treatmentRecord, String paymentMethod, long expirationMinutes) {
        PaymentTransaction paymentTransaction = paymentTransactionRepository.findTopByRecordIdOrderByCreatedAtDesc(treatmentRecord.getId())
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_TRANSACTION_NOT_FOUND));
        paymentTransaction.setStatus("FAILED");
        paymentTransactionRepository.save(paymentTransaction);
        return createTransaction(treatmentRecord, paymentMethod, expirationMinutes);
    }

    @Scheduled(fixedRate = 62000) // 62 giây
    public void expirePendingTransactions() {
        List<PaymentTransaction> expiredTransactions = paymentTransactionRepository
                .findAllByStatusAndExpiredAtBefore("PENDING", LocalDateTime.now());

        for (PaymentTransaction tx : expiredTransactions) {
            tx.setStatus("FAILED");
        }

        if (!expiredTransactions.isEmpty()) {
            paymentTransactionRepository.saveAll(expiredTransactions);
            log.info("Đã cập nhật {} giao dịch quá hạn thành FAILED", expiredTransactions.size());
        }
    }

    public void cancelled(Long recordId) {
        PaymentTransaction paymentTransaction = paymentTransactionRepository.findTopByRecordIdOrderByCreatedAtDesc(recordId)
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_TRANSACTION_NOT_FOUND));
        paymentTransaction.setStatus("FAILED");
        paymentTransactionRepository.save(paymentTransaction);
    }

}
