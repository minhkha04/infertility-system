package com.emmkay.infertility_system_api.modules.payment.builder;

import com.emmkay.infertility_system_api.modules.payment.configuration.MomoConfig;
import com.emmkay.infertility_system_api.modules.payment.dto.request.MomoConfirmRequest;
import com.emmkay.infertility_system_api.modules.payment.dto.request.MomoCreateRequest;
import com.emmkay.infertility_system_api.modules.payment.dto.request.MomoIpnRequest;
import com.emmkay.infertility_system_api.modules.payment.entity.PaymentTransaction;
import com.emmkay.infertility_system_api.modules.payment.util.MomoSignatureUtil;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class MomoRequestBuilder {

    MomoConfig momoConfig;
    MomoSignatureUtil momoSignatureUtil;

    public MomoCreateRequest buildMomoRequest(PaymentTransaction tx, String requestId) {
        String orderId = tx.getTransactionCode();
        long amount = tx.getAmount().longValue();
        String orderInfo = "Thanh toán đơn hàng: " + orderId;
        String extraData = "";

        String rawSignature = String.format(
                "accessKey=%s&amount=%s&extraData=%s&ipnUrl=%s&orderId=%s&orderInfo=%s&partnerCode=%s&redirectUrl=%s&requestId=%s&requestType=%s",
                momoConfig.getAccessKey(), amount, extraData, momoConfig.getIpnUrl(),
                orderId, orderInfo, momoConfig.getPartnerCode(), momoConfig.getReturnUrl(),
                requestId, momoConfig.getRequestType()
        );

        String signature = momoSignatureUtil.hmacSHA256(rawSignature, momoConfig.getSecretKey());

        return MomoCreateRequest.builder()
                .partnerCode(momoConfig.getPartnerCode())
                .requestType(momoConfig.getRequestType())
                .ipnUrl(momoConfig.getIpnUrl())
                .redirectUrl(momoConfig.getReturnUrl())
                .orderId(orderId)
                .orderInfo(orderInfo)
                .requestId(requestId)
                .extraData(extraData)
                .amount(amount)
                .signature(signature)
                .lang("vi")
                .autoCapture(false)
                .build();
    }

    public MomoConfirmRequest buildMomoConfirmRequest(PaymentTransaction tx, String requestType) {
        String requestId = UUID.randomUUID().toString();

        MomoConfirmRequest momoConfirmRequest = MomoConfirmRequest.builder()
                .partnerCode(momoConfig.getPartnerCode())
                .requestId(requestId)
                .orderId(tx.getTransactionCode())
                .requestType(requestType)
                .amount(tx.getAmount().longValue())
                .lang("vi")
                .description("Huy giao dich")
                .build();

        String rawSignature = String.format(
                "accessKey=%s&amount=%s&description=%s&orderId=%s&partnerCode=%s&requestId=%s&requestType=%s",
                momoConfig.getAccessKey(),
                momoConfirmRequest.getAmount(),
                momoConfirmRequest.getDescription() != null ? momoConfirmRequest.getDescription() : "",
                momoConfirmRequest.getOrderId(),
                momoConfig.getPartnerCode(),
                momoConfirmRequest.getRequestId(),
                momoConfirmRequest.getRequestType()
        );

        momoConfirmRequest.setSignature(momoSignatureUtil.hmacSHA256(rawSignature, momoConfig.getSecretKey()));
        return momoConfirmRequest;

    }

    public String buildRawData(MomoIpnRequest request) {
        return  String.format(
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
    }
}
