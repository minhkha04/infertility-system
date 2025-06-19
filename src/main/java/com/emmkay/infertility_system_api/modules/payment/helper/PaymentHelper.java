package com.emmkay.infertility_system_api.modules.payment.helper;

import com.emmkay.infertility_system_api.modules.payment.configuration.MomoConfig;
import com.emmkay.infertility_system_api.modules.payment.configuration.VnPayConfig;
import com.emmkay.infertility_system_api.modules.payment.dto.request.MomoConfirmRequest;
import com.emmkay.infertility_system_api.modules.payment.dto.request.MomoCreateRequest;
import com.emmkay.infertility_system_api.modules.payment.entity.PaymentTransaction;
import com.emmkay.infertility_system_api.modules.payment.repository.PaymentTransactionRepository;
import com.emmkay.infertility_system_api.modules.treatment.entity.TreatmentRecord;
import com.emmkay.infertility_system_api.modules.shared.exception.AppException;
import com.emmkay.infertility_system_api.modules.shared.exception.ErrorCode;
import com.emmkay.infertility_system_api.modules.treatment.repository.TreatmentRecordRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Component
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class PaymentHelper {

    TreatmentRecordRepository treatmentRecordRepository;
    VnPayConfig vnPayConfig;
    PaymentTransactionRepository paymentTransactionRepository;
    MomoConfig momoConfig;

    public String getOrderId(Long recordId) {
        return "TR" + recordId + "-" + System.currentTimeMillis();
    }

    public String hmacSHA256(String data, String secretKey) {
        try {
            SecretKeySpec secretKeySpec = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(secretKeySpec);
            byte[] hmacBytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));

            // Convert to hex
            StringBuilder sb = new StringBuilder();
            for (byte b : hmacBytes) {
                sb.append(String.format("%02x", b & 0xff));
            }
            return sb.toString();

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate HMAC SHA256 signature", e);
        }
    }

    public long extractRecordId(String orderId) {
        String raw = orderId.replace("TR", "");
        int idx = raw.indexOf('-');
        String idPart = raw.substring(0, idx);
        return Long.parseLong(idPart);
    }

    public String hmacSHA512(String key, String data) {
        try {

            if (key == null || data == null) {
                throw new NullPointerException();
            }
            final Mac hmac512 = Mac.getInstance("HmacSHA512");
            byte[] hmacKeyBytes = key.getBytes();
            final SecretKeySpec secretKey = new SecretKeySpec(hmacKeyBytes, "HmacSHA512");
            hmac512.init(secretKey);
            byte[] dataBytes = data.getBytes(StandardCharsets.UTF_8);
            byte[] result = hmac512.doFinal(dataBytes);
            StringBuilder sb = new StringBuilder(2 * result.length);
            for (byte b : result) {
                sb.append(String.format("%02x", b & 0xff));
            }
            return sb.toString();

        } catch (Exception ex) {
            return "";
        }
    }

    public  String getIpAddress(HttpServletRequest request) {
        String ipAdress;
        try {
            ipAdress = request.getHeader("X-FORWARDED-FOR");
            if (ipAdress == null) {
                ipAdress = request.getRemoteAddr();
            }
        } catch (Exception e) {
            ipAdress = "Invalid IP:" + e.getMessage();
        }
        return ipAdress;
    }

    public String hashAllFields(Map fields) {
        List fieldNames = new ArrayList(fields.keySet());
        Collections.sort(fieldNames);
        StringBuilder sb = new StringBuilder();
        Iterator itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = (String) itr.next();
            String fieldValue = (String) fields.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                sb.append(fieldName);
                sb.append("=");
                sb.append(fieldValue);
            }
            if (itr.hasNext()) {
                sb.append("&");
            }
        }
        return hmacSHA512(vnPayConfig.getHashSecret(),sb.toString());
    }

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

        String signature = hmacSHA256(rawSignature, momoConfig.getSecretKey());

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

        momoConfirmRequest.setSignature(hmacSHA256(rawSignature, momoConfig.getSecretKey()));
        return momoConfirmRequest;

    }
}
