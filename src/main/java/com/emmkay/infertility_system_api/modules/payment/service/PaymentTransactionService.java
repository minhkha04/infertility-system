package com.emmkay.infertility_system_api.modules.payment.service;

import com.emmkay.infertility_system_api.modules.payment.entity.PaymentTransaction;
import com.emmkay.infertility_system_api.modules.payment.repository.PaymentTransactionRepository;
import com.emmkay.infertility_system_api.modules.payment.util.PaymentUtil;
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

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class PaymentTransactionService {

    PaymentTransactionRepository paymentTransactionRepository;
    PaymentUtil paymentUtil;
    TreatmentRecordRepository treatmentRecordRepository;

    public PaymentTransaction createTransaction(TreatmentRecord treatmentRecord, String paymentMethod, long expirationMinutes) {
        PaymentTransaction paymentTransaction = PaymentTransaction.builder()
                .transactionCode(paymentUtil.getOrderId(treatmentRecord.getId()))
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

    public void updateStatus(PaymentTransaction paymentTransaction, String status) {
        paymentTransaction.setStatus(status);
        if (status.equalsIgnoreCase("SUCCESS")) {
            TreatmentRecord treatmentRecord = treatmentRecordRepository.findByIdAndStatus(paymentTransaction.getRecord().getId(), "PENDING")
                    .orElseThrow(() -> new AppException(ErrorCode.TREATMENT_RECORD_NOT_FOUND));
                treatmentRecord.setStatus("INPROGRESS");
                treatmentRecordRepository.save(treatmentRecord);
        }
        paymentTransactionRepository.save(paymentTransaction);
    }

    public boolean isPaid(Long recordId) {
        return paymentTransactionRepository.existsByRecordIdAndStatus(recordId, "SUCCESS");
    }
}
