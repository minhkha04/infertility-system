package com.emmkay.infertility_system.modules.payment.service;

import com.emmkay.infertility_system.modules.payment.entity.PaymentTransaction;
import com.emmkay.infertility_system.modules.payment.enums.PaymentMethod;
import com.emmkay.infertility_system.modules.payment.enums.PaymentStatus;
import com.emmkay.infertility_system.modules.payment.projection.PaymentInfoProjection;
import com.emmkay.infertility_system.modules.payment.repository.PaymentTransactionRepository;
import com.emmkay.infertility_system.modules.payment.util.PaymentUtil;
import com.emmkay.infertility_system.modules.shared.exception.AppException;
import com.emmkay.infertility_system.modules.shared.exception.ErrorCode;
import com.emmkay.infertility_system.modules.shared.security.CurrentUserUtils;
import com.emmkay.infertility_system.modules.treatment.entity.TreatmentRecord;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class PaymentTransactionService {

    PaymentTransactionRepository paymentTransactionRepository;
    PaymentUtil paymentUtil;

    public PaymentTransaction createTransaction(TreatmentRecord treatmentRecord, PaymentMethod paymentMethod, long expirationMinutes) {
        ZoneId zoneId = ZoneId.of("Asia/Ho_Chi_Minh");
        ZonedDateTime nowZoned = ZonedDateTime.now(zoneId);
        ZonedDateTime expiredZoned = nowZoned.plusMinutes(expirationMinutes);

        PaymentTransaction paymentTransaction = PaymentTransaction.builder()
                .transactionCode(paymentUtil.getOrderId(treatmentRecord.getId()))
                .record(treatmentRecord)
                .status(PaymentStatus.PENDING)
                .amount(treatmentRecord.getService().getPrice())
                .paymentMethod(paymentMethod)
                .createdAt(nowZoned.toLocalDateTime())
                .expiredAt(expiredZoned.toLocalDateTime())
                .customer(treatmentRecord.getCustomer())
                .service(treatmentRecord.getService())
                .build();
        return paymentTransactionRepository.save(paymentTransaction);
    }

    public PaymentTransaction reloadTransaction(TreatmentRecord treatmentRecord, PaymentMethod paymentMethod, long expirationMinutes) {
        PaymentTransaction paymentTransaction = paymentTransactionRepository.findTopByRecordIdOrderByCreatedAtDesc(treatmentRecord.getId())
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_TRANSACTION_NOT_FOUND));
        paymentTransaction.setStatus(PaymentStatus.FAILED);
        paymentTransactionRepository.save(paymentTransaction);
        return createTransaction(treatmentRecord, paymentMethod, expirationMinutes);
    }

    @Scheduled(fixedRate = 62000) // 62 giây
    public void expirePendingTransactions() {
        ZoneId zoneId = ZoneId.of("Asia/Ho_Chi_Minh");
        ZonedDateTime nowZoned = ZonedDateTime.now(zoneId);
        List<PaymentTransaction> expiredTransactions = paymentTransactionRepository
                .findAllByStatusAndExpiredAtBefore(PaymentStatus.PENDING, nowZoned.toLocalDateTime());

        for (PaymentTransaction tx : expiredTransactions) {
            tx.setStatus(PaymentStatus.FAILED);
        }

        if (!expiredTransactions.isEmpty()) {
            paymentTransactionRepository.saveAll(expiredTransactions);
            log.info("Đã cập nhật {} giao dịch quá hạn thành FAILED", expiredTransactions.size());
        }
    }

    public void cancelled(Long recordId) {
        PaymentTransaction paymentTransaction = paymentTransactionRepository.findTopByRecordIdOrderByCreatedAtDesc(recordId)
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_TRANSACTION_NOT_FOUND));
        paymentTransaction.setStatus(PaymentStatus.FAILED);
        paymentTransactionRepository.save(paymentTransaction);
    }

    public void updateStatus(PaymentTransaction paymentTransaction, PaymentStatus status) {
        paymentTransaction.setStatus(status);
        paymentTransactionRepository.save(paymentTransaction);
    }

    public boolean isPaid(Long recordId) {
        return paymentTransactionRepository.existsByRecordIdAndStatus(recordId, PaymentStatus.SUCCESS);
    }

    public Page<PaymentInfoProjection> getPaymentInfo(int page, int size) {
        String currentUserId = CurrentUserUtils.getCurrentUserId();
        if (currentUserId == null || currentUserId.isBlank()) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        Pageable pageable = PageRequest.of(page, size);
        return paymentTransactionRepository.searchPaymentInfo(currentUserId, pageable);
    }
}
