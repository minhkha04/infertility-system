package com.emmkay.infertility_system_api.service.payment;

import com.emmkay.infertility_system_api.dto.response.TreatmentRecordResponse;
import jakarta.servlet.http.HttpServletRequest;

import java.io.UnsupportedEncodingException;

public interface PaymentStrategy {
    String createPaymentUrl(Object request, Long recordId) throws UnsupportedEncodingException;
    TreatmentRecordResponse processReturnUrl(Object object);
    String getPaymentMethod();
}
