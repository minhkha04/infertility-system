package com.emmkay.infertility_system_api.modules.payment.service;

import com.emmkay.infertility_system_api.modules.payment.repository.PaymentTransactionRepository;
import com.emmkay.infertility_system_api.modules.shared.exception.AppException;
import com.emmkay.infertility_system_api.modules.shared.exception.ErrorCode;
import com.emmkay.infertility_system_api.modules.treatment.entity.TreatmentRecord;
import com.emmkay.infertility_system_api.modules.treatment.repository.TreatmentRecordRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class PaymentEligibilityService {

    TreatmentRecordRepository treatmentRecordRepository;
    PaymentTransactionRepository paymentTransactionRepository;

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
}
