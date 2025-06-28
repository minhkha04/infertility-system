package com.emmkay.infertility_system_api.modules.payment.service;

import com.emmkay.infertility_system_api.modules.payment.enums.PaymentMethod;
import com.emmkay.infertility_system_api.modules.payment.projection.PaymentInfoProjection;
import com.emmkay.infertility_system_api.modules.payment.strategy.PaymentStrategy;
import com.emmkay.infertility_system_api.modules.payment.strategy.PaymentStrategyFactory;
import com.emmkay.infertility_system_api.modules.shared.exception.AppException;
import com.emmkay.infertility_system_api.modules.shared.exception.ErrorCode;
import com.emmkay.infertility_system_api.modules.shared.security.CurrentUserUtils;
import com.emmkay.infertility_system_api.modules.treatment.entity.TreatmentRecord;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class PaymentService {

    PaymentStrategyFactory paymentStrategyFactory;
    PaymentEligibilityService paymentEligibilityService;

    public String createPayment(PaymentMethod paymentMethod, Object request, Long recordId) {
        String currentUserId = CurrentUserUtils.getCurrentUserId();
        TreatmentRecord treatmentRecord = paymentEligibilityService.isAvailable(recordId, false);
        if (currentUserId == null || currentUserId.isBlank() || !treatmentRecord.getCustomer().getId().equalsIgnoreCase(currentUserId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        PaymentStrategy strategy = paymentStrategyFactory.getStrategy(paymentMethod);
        return strategy.createPayment(request, treatmentRecord);
    }

    public boolean processReturnUrl(PaymentMethod method, Object object) {
        PaymentStrategy strategy = paymentStrategyFactory.getStrategy(method);
        return strategy.handleIpn(object);
    }

    public String reloadPayment(PaymentMethod paymentMethod, Object request, Long recordId) {
        String currentUserId = CurrentUserUtils.getCurrentUserId();
        PaymentStrategy strategy = paymentStrategyFactory.getStrategy(paymentMethod);
        TreatmentRecord treatmentRecord = paymentEligibilityService.isAvailable(recordId, true);
        if (currentUserId == null || currentUserId.isBlank() || !treatmentRecord.getCustomer().getId().equalsIgnoreCase(currentUserId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        return strategy.reloadPayment(request, treatmentRecord);
    }

}
