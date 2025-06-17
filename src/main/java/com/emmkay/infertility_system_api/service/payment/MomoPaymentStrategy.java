package com.emmkay.infertility_system_api.service.payment;

import com.emmkay.infertility_system_api.client.MomoApi;
import com.emmkay.infertility_system_api.configuration.payment.MomoConfig;
import com.emmkay.infertility_system_api.dto.request.MomoCreateRequest;
import com.emmkay.infertility_system_api.dto.request.MomoIpnRequest;
import com.emmkay.infertility_system_api.dto.response.MomoCreateResponse;
import com.emmkay.infertility_system_api.dto.response.TreatmentRecordResponse;
import com.emmkay.infertility_system_api.entity.TreatmentRecord;
import com.emmkay.infertility_system_api.exception.AppException;
import com.emmkay.infertility_system_api.exception.ErrorCode;
import com.emmkay.infertility_system_api.helper.PaymentHelper;
import com.emmkay.infertility_system_api.service.TreatmentRecordService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class MomoPaymentStrategy implements PaymentStrategy {

    PaymentHelper paymentHelper;
    MomoConfig momoConfig;
    MomoApi momoApi;
    TreatmentRecordService treatmentRecordService;

    @Override
    public String createPaymentUrl(Object request, Long recordId) {
        TreatmentRecord treatmentRecord = paymentHelper.isAvailable(recordId);
        String orderId = paymentHelper.getOrderId(recordId);
        long amount = treatmentRecord.getService().getPrice().longValue();
        String requestId = UUID.randomUUID().toString();
        String orderInfo = "Thanh toan don hang: " + orderId;
        String extraData = "";

        String rawSignature = String.format(
                "accessKey=%s&amount=%s&extraData=%s&ipnUrl=%s&orderId=%s&orderInfo=%s&partnerCode=%s&redirectUrl=%s&requestId=%s&requestType=%s",
                momoConfig.getAccessKey(),
                amount,
                extraData,
                momoConfig.getIpnUrl(),
                orderId,
                orderInfo,
                momoConfig.getPartnerCode(),
                momoConfig.getReturnUrl(),
                requestId,
                momoConfig.getRequestType()
        );

        String signature = paymentHelper.hmacSHA256(rawSignature, momoConfig.getSecretKey());
        MomoCreateRequest momoCreateRequest = MomoCreateRequest.builder()
                .partnerCode(momoConfig.getPartnerCode())
                .requestType(momoConfig.getRequestType())
                .ipnUrl(momoConfig.getIpnUrl())
                .redirectUrl(momoConfig.getReturnUrl())
                .orderId(orderId)
                .orderInfo(orderInfo)
                .requestId(requestId)
                .extraData("")
                .amount(amount)
                .signature(signature)
                .lang("vi")
                .build();

        return momoApi.createMomoQr(momoCreateRequest).getQrCodeUrl();
    }

    @Override
    public TreatmentRecordResponse processReturnUrl(Object object) {
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
            if (request.getResultCode() == 0) {
                log.info("Payment successful: {}", request);
                long recordId = paymentHelper.extractRecordId(request.getOrderId());
                return treatmentRecordService.updatePaid(recordId);
            } else {
                log.info(request.getMessage());
                throw new AppException(ErrorCode.PAYMENT_FAIL);
            }

        } catch (Exception e) {
            throw new AppException(ErrorCode.VERIFY_PAYMENT_FAIL);
        }
    }

    @Override
    public String getPaymentMethod() {
        return "MOMO";
    }
}