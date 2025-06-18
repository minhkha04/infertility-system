package com.emmkay.infertility_system_api.modules.payment.strategy;

import com.emmkay.infertility_system_api.modules.shared.exception.AppException;
import com.emmkay.infertility_system_api.modules.shared.exception.ErrorCode;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class PaymentStrategyFactory {
    List<PaymentStrategy> strategies;

    public PaymentStrategy getStrategy(String paymentMethod) {
        return strategies.stream()
                .filter(s -> s.getPaymentMethod().equalsIgnoreCase(paymentMethod))
                .findFirst()
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_METHOD_NOT_SUPPORTED));
    }
}
