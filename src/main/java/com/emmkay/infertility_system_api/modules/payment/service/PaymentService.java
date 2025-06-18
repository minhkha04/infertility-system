package com.emmkay.infertility_system_api.modules.payment.service;

import com.emmkay.infertility_system_api.modules.treatment.dto.response.TreatmentRecordResponse;
import com.emmkay.infertility_system_api.modules.payment.strategy.PaymentStrategy;
import com.emmkay.infertility_system_api.modules.payment.strategy.PaymentStrategyFactory;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class PaymentService {
    PaymentStrategyFactory paymentStrategyFactory;

    public String createPaymentUrl(String paymentMethod, Object request, Long recordId) throws UnsupportedEncodingException {
        PaymentStrategy strategy = paymentStrategyFactory.getStrategy(paymentMethod);
        return strategy.createPaymentUrl(request, recordId);
    }

    public TreatmentRecordResponse processReturnUrl(String method, Object object) {
        PaymentStrategy strategy = paymentStrategyFactory.getStrategy(method);
        return strategy.processReturnUrl(object);
    }
}
