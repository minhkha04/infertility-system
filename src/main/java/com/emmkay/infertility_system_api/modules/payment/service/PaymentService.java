package com.emmkay.infertility_system_api.modules.payment.service;

import com.emmkay.infertility_system_api.modules.payment.repository.PaymentTransactionRepository;
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
    PaymentTransactionRepository paymentTransactionRepository;

    public String createPayment(String paymentMethod, Object request, Long recordId) throws UnsupportedEncodingException {
        PaymentStrategy strategy = paymentStrategyFactory.getStrategy(paymentMethod);
        return strategy.createPayment(request, recordId);
    }

    public boolean processReturnUrl(String method, Object object) {
        PaymentStrategy strategy = paymentStrategyFactory.getStrategy(method);
        return strategy.handleIpn(object);
    }

    public String reloadPayment(String paymentMethod, Object request, Long recordId) {
        PaymentStrategy strategy = paymentStrategyFactory.getStrategy(paymentMethod);
        return strategy.reloadPayment(request, recordId);
    }


}
