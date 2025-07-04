package com.emmkay.infertility_system.modules.payment.service;

import com.emmkay.infertility_system.modules.payment.enums.PaymentStatus;
import com.emmkay.infertility_system.modules.payment.repository.PaymentTransactionRepository;
import com.emmkay.infertility_system.modules.shared.exception.AppException;
import com.emmkay.infertility_system.modules.shared.exception.ErrorCode;
import com.emmkay.infertility_system.modules.treatment.entity.TreatmentRecord;
import com.emmkay.infertility_system.modules.treatment.enums.TreatmentRecordStatus;
import com.emmkay.infertility_system.modules.treatment.repository.TreatmentRecordRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class PaymentValidator {

    TreatmentRecordRepository treatmentRecordRepository;
    PaymentTransactionRepository paymentTransactionRepository;

    public TreatmentRecord isAvailable(Long recordId, boolean isReload) {
        TreatmentRecord treatmentRecord = treatmentRecordRepository.findById(recordId)
                .orElseThrow(() -> new AppException(ErrorCode.TREATMENT_RECORD_NOT_FOUND));

        if (treatmentRecord.getStatus() == TreatmentRecordStatus.CANCELLED) {
            throw new AppException(ErrorCode.CANNOT_PAY);
        }
        boolean hasSuccess = paymentTransactionRepository.existsByRecordAndStatus(treatmentRecord, PaymentStatus.SUCCESS);
        if (hasSuccess) {
            throw new AppException(ErrorCode.PAYMENT_SUCCESS);
        }
        if (!isReload) {
            boolean hasPending = paymentTransactionRepository.existsByRecordAndStatus(treatmentRecord, PaymentStatus.PENDING);
            if (hasPending) {
                throw new AppException(ErrorCode.PAYMENT_PENDING);
            }
        }
        return treatmentRecord;
    }
}
