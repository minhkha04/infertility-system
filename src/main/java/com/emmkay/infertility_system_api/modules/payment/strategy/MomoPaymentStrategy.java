package com.emmkay.infertility_system_api.modules.payment.strategy;

import com.emmkay.infertility_system_api.modules.payment.client.MomoApi;
import com.emmkay.infertility_system_api.modules.payment.configuration.MomoConfig;
import com.emmkay.infertility_system_api.modules.payment.dto.request.MomoConfirmRequest;
import com.emmkay.infertility_system_api.modules.payment.dto.request.MomoCreateRequest;
import com.emmkay.infertility_system_api.modules.payment.dto.request.MomoIpnRequest;
import com.emmkay.infertility_system_api.modules.payment.dto.response.MomoConfirmResponse;
import com.emmkay.infertility_system_api.modules.payment.dto.response.MomoCreateResponse;
import com.emmkay.infertility_system_api.modules.payment.entity.PaymentTransaction;
import com.emmkay.infertility_system_api.modules.payment.helper.QrCodeHelper;
import com.emmkay.infertility_system_api.modules.payment.repository.PaymentTransactionRepository;
import com.emmkay.infertility_system_api.modules.payment.service.PaymentTransactionService;
import com.emmkay.infertility_system_api.modules.treatment.entity.TreatmentRecord;
import com.emmkay.infertility_system_api.modules.shared.exception.AppException;
import com.emmkay.infertility_system_api.modules.shared.exception.ErrorCode;
import com.emmkay.infertility_system_api.modules.payment.helper.PaymentHelper;
import com.emmkay.infertility_system_api.modules.treatment.service.TreatmentRecordService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class MomoPaymentStrategy implements PaymentStrategy {

    PaymentHelper paymentHelper;
    MomoConfig momoConfig;
    MomoApi momoApi;
    PaymentTransactionRepository paymentTransactionRepository;
    QrCodeHelper qrCodeHelper;
    PaymentTransactionService paymentTransactionService;

    @Override
    public String createPayment(Object request, Long recordId) {
        TreatmentRecord treatmentRecord = paymentTransactionService.isAvailable(recordId, false);
        PaymentTransaction paymentTransaction = paymentTransactionService.createTransaction(treatmentRecord, "MOMO", 5);
        MomoCreateRequest momoCreateRequest = paymentHelper.buildMomoRequest(paymentTransaction, UUID.randomUUID().toString());
        MomoCreateResponse momoCreateResponse = momoApi.createMomoQr(momoCreateRequest);
        String url = momoCreateResponse.getQrCodeUrl();
        return qrCodeHelper.generateQrBase64(url);
    }

    @Override
    public boolean handleIpn(Object object) {
        try {
            // 1. Build rawData để verify chữ ký
            MomoIpnRequest request = (MomoIpnRequest) object;
            String rawData = String.format(
                    "accessKey=%s&amount=%s&extraData=%s&message=%s&orderId=%s&orderInfo=%s&orderType=%s&partnerCode=%s&payType=%s&requestId=%s&responseTime=%s&resultCode=%s&transId=%s",
                    momoConfig.getAccessKey(),
                    request.getAmount(),
                    request.getExtraData(),
                    request.getMessage(),
                    request.getOrderId(),
                    request.getOrderInfo(),
                    request.getOrderType(),
                    request.getPartnerCode(),
                    request.getPayType(),
                    request.getRequestId(),
                    request.getResponseTime(),
                    request.getResultCode(),
                    request.getTransId()
            );
            // 2. So sánh chữ ký
            String expectedSignature = paymentHelper.hmacSHA256(rawData, momoConfig.getSecretKey());
            if (!expectedSignature.equals(request.getSignature())) {
                throw new AppException(ErrorCode.VERIFY_PAYMENT_FAIL);
            }
            // 3. Xử lý logic thanh toán
            String transactionCode = request.getOrderId();
            PaymentTransaction paymentTransaction = paymentTransactionRepository.findByTransactionCode(transactionCode)
                    .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_TRANSACTION_NOT_FOUND));

            if (paymentTransaction.getStatus().equalsIgnoreCase("FAILED")) {
                log.warn("Payment failed: {}", paymentTransaction.getTransactionCode());
                processPayment(paymentTransaction, "cancel");
                return false;
            }

            if (paymentTransaction.getStatus().equalsIgnoreCase("PENDING")) {
                log.info("Payment success");
                paymentTransaction.setStatus("SUCCESS");
                processPayment(paymentTransaction, "capture");
            }
            paymentTransactionRepository.save(paymentTransaction);
            return true;
//            if (request.getResultCode() == 0) {
//                log.info("Payment successful: {}", request);
//                paymentTransaction.setStatus("SUCCESS");
//                paymentTransactionRepository.save(paymentTransaction);
//                return true;
//            } else {
//                log.info(request.getMessage());
//                paymentTransaction.setStatus("FAILED");
//                paymentTransactionRepository.save(paymentTransaction);
//                return false;
//            }
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public String getPaymentMethod() {
        return "MOMO";
    }

    @Override
    public String reloadPayment(Object request, Long recordId) {
        TreatmentRecord treatmentRecord = paymentTransactionService.isAvailable(recordId, true);
        PaymentTransaction paymentTransaction = paymentTransactionService.reloadTransaction(treatmentRecord, "MOMO", 5);
        MomoCreateRequest momoCreateRequest = paymentHelper.buildMomoRequest(paymentTransaction, UUID.randomUUID().toString());
        MomoCreateResponse momoCreateResponse = momoApi.createMomoQr(momoCreateRequest);
        String url = momoCreateResponse.getQrCodeUrl();
        return qrCodeHelper.generateQrBase64(url);
    }


    public void processPayment(PaymentTransaction paymentTransaction, String requestType) {
        MomoConfirmRequest momoConfirmRequest = paymentHelper.buildMomoConfirmRequest(paymentTransaction, requestType);
        MomoConfirmResponse response = momoApi.confirmMomoPayment(momoConfirmRequest);
        switch (requestType.toLowerCase()) {
            case "capture":
                log.info("Payment successful");
                if (response.getResultCode() == 0) {
                    log.info("Successful: {}", response.getMessage());
                    paymentTransaction.setStatus("SUCCESS");
                    paymentTransactionRepository.save(paymentTransaction);
                } else {
                    log.info("Failed: {}", response.getMessage());
                    paymentTransaction.setStatus("FAILED");
                    paymentTransactionRepository.save(paymentTransaction);
                }
                break;
            case "cancel":
                if ("0".equals(response.getResultCode())) {
                    log.info("Successfully cancelled");
                } else {
                    log.error("Failed to cancel transaction");
                    log.info("Failed: {}", response.getMessage());
                }
                paymentTransaction.setStatus("FAILED");
                paymentTransactionRepository.save(paymentTransaction);
            default:
                throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }

    }
}