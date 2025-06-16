package com.emmkay.infertility_system_api.helper;

import com.emmkay.infertility_system_api.dto.response.TreatmentRecordResponse;
import com.emmkay.infertility_system_api.entity.TreatmentRecord;
import com.emmkay.infertility_system_api.exception.AppException;
import com.emmkay.infertility_system_api.exception.ErrorCode;
import com.emmkay.infertility_system_api.repository.TreatmentRecordRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Component;

import java.util.Random;

@Component
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class PaymentHelper {

    TreatmentRecordRepository treatmentRecordRepository;

    public String getOrderId(Long recordID) {
        return getRandomNumber(8) + "TR" + recordID;
    }

    public String getRandomNumber(int len) {
        Random rnd = new Random();
        String chars = "0123456789";
        StringBuilder sb = new StringBuilder(len);
        for (int i = 0; i < len; i++) {
            sb.append(chars.charAt(rnd.nextInt(chars.length())));
        }
        return sb.toString();
    }

    public TreatmentRecord isAvailable(Long recordId) {
        TreatmentRecord treatmentRecord = treatmentRecordRepository.findById(recordId)
                .orElseThrow(() -> new AppException(ErrorCode.TREATMENT_RECORD_NOT_FOUND));

        if (treatmentRecord.getStatus().equalsIgnoreCase("CANCELLED")) {
            throw new AppException(ErrorCode.CANNOT_PAY);
        }
        if (treatmentRecord.getIsPaid()) {
            throw new AppException(ErrorCode.HAS_BEEN_PAID);
        }

        return treatmentRecord;
    }

}
