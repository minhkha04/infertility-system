package com.emmkay.infertility_system_api.modules.payment.strategy;

import com.emmkay.infertility_system_api.modules.treatment.dto.response.TreatmentRecordResponse;

import java.io.UnsupportedEncodingException;

public interface PaymentStrategy {
    String createPaymentUrl(Object request, Long recordId) throws UnsupportedEncodingException;
    TreatmentRecordResponse processReturnUrl(Object object);
    String getPaymentMethod();
}
