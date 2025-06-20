package com.emmkay.infertility_system_api.modules.payment.strategy;

import com.emmkay.infertility_system_api.modules.payment.builder.VnPayRedirectUrlBuilder;
import com.emmkay.infertility_system_api.modules.payment.configuration.VnPayConfig;
import com.emmkay.infertility_system_api.modules.payment.entity.PaymentTransaction;
import com.emmkay.infertility_system_api.modules.payment.repository.PaymentTransactionRepository;
import com.emmkay.infertility_system_api.modules.payment.service.PaymentEligibilityService;
import com.emmkay.infertility_system_api.modules.payment.service.PaymentTransactionService;
import com.emmkay.infertility_system_api.modules.payment.util.VnPaySignatureUtil;
import com.emmkay.infertility_system_api.modules.treatment.entity.TreatmentRecord;
import com.emmkay.infertility_system_api.modules.shared.exception.AppException;
import com.emmkay.infertility_system_api.modules.shared.exception.ErrorCode;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class VnPaymentStrategy implements PaymentStrategy {

    VnPayConfig vnPayConfig;
    VnPaySignatureUtil vnPaySignatureUtil;
    PaymentEligibilityService paymentEligibilityService;
    PaymentTransactionService paymentTransactionService;
    VnPayRedirectUrlBuilder vnPayRedirectUrlBuilder;
    PaymentTransactionRepository paymentTransactionRepository;

    @Override
    public String createPayment(Object request, Long recordId) {
        HttpServletRequest req;
        try {
            req = (HttpServletRequest) request;
        } catch (Exception e) {
            log.error("Error when create payment url: {}", e.getMessage());
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }
        TreatmentRecord treatmentRecord = paymentEligibilityService.isAvailable(recordId, false);

        PaymentTransaction paymentTransaction = paymentTransactionService.createTransaction(treatmentRecord, "VNPAY", 5);

        return vnPayRedirectUrlBuilder.buildRedirectUrl(paymentTransaction, req);
    }


    @Override
    public boolean handleIpn(Object object) {
        try {
            HttpServletRequest request = (HttpServletRequest) object;

            Map fields = new HashMap();
            for (Enumeration params = request.getParameterNames(); params.hasMoreElements();) {
                String fieldName = URLEncoder.encode((String) params.nextElement(), StandardCharsets.US_ASCII.toString());
                String fieldValue = URLEncoder.encode(request.getParameter(fieldName), StandardCharsets.US_ASCII.toString());
                if ((fieldValue != null) && (fieldValue.length() > 0)) {
                    fields.put(fieldName, fieldValue);
                }
            }

            String vnp_SecureHash = request.getParameter("vnp_SecureHash");
            if (fields.containsKey("vnp_SecureHashType"))
            {
                fields.remove("vnp_SecureHashType");
            }
            if (fields.containsKey("vnp_SecureHash"))
            {
                fields.remove("vnp_SecureHash");
            }
            String signValue = vnPaySignatureUtil.hashAllFields(fields, vnPayConfig.getHashSecret());
            if (signValue.equalsIgnoreCase(vnp_SecureHash)) {
                String transactionCode = request.getParameter("vnp_TxnRef");
                PaymentTransaction paymentTransaction = paymentTransactionRepository
                        .findByTransactionCode(transactionCode)
                        .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_TRANSACTION_NOT_FOUND));

                String responseCode = request.getParameter("vnp_ResponseCode");

                if ("00".equals(responseCode)) {
                    paymentTransactionService.updateStatus(paymentTransaction, "SUCCESS");
                } else {
                    paymentTransactionService.updateStatus(paymentTransaction, "FAILED");
                }
            }
            return true;

        } catch (Exception e) {
            log.error("Exception in handleIpn (VNPAY IPN): ", e);
            return false;
        }
    }

    @Override
    public String getPaymentMethod() {
        return "VNPAY";
    }

    @Override
    public String reloadPayment(Object request, Long recordId) {
        return "";
    }
}
