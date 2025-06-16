package com.emmkay.infertility_system_api.service.payment;

import com.emmkay.infertility_system_api.client.MomoApi;
import com.emmkay.infertility_system_api.configuration.payment.MomoConfig;
import com.emmkay.infertility_system_api.dto.request.MomoCreateRequest;
import com.emmkay.infertility_system_api.dto.response.MomoCreateResponse;
import com.emmkay.infertility_system_api.dto.response.TreatmentRecordResponse;
import com.emmkay.infertility_system_api.entity.TreatmentRecord;
import com.emmkay.infertility_system_api.helper.PaymentHelper;
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

    @Override
    public String createPaymentUrl(Object request, Long recordId) throws UnsupportedEncodingException {



        TreatmentRecord treatmentRecord = paymentHelper.isAvailable(recordId);
        String orderId = paymentHelper.getOrderId(recordId);
        String amount = treatmentRecord.getService().getPrice().multiply(new java.math.BigDecimal(100)).toBigInteger().toString();

        return "";
    }

    public MomoCreateResponse createQr() {

        String orderId = UUID.randomUUID().toString();
        String orderInfo = "Thanh toan don hang: " + orderId;
        String requestId = UUID.randomUUID().toString();
        String extraData = "Khong co khuyen mai";
        long amount = 100000;

        String rawSignature = String.format("accessKey=$accessKey&amount=$amount&extraData=$extraData&ipnUrl=$ipnUrl&orderId=$orderId&orderInfo=$orderInfo&partnerCode=$partnerCode&redirectUrl=$redirectUrl&requestId=$requestId&requestType=$requestType", momoConfig.getAccessKey(), amount, extraData, momoConfig.getIpnUrl(), orderId, orderInfo, momoConfig.getPartnerCode(), momoConfig.getReturnUrl(), requestId, momoConfig.getRequestType());

        String signature = hmacSHA256(rawSignature, momoConfig.getSecretKey());
        MomoCreateRequest request = MomoCreateRequest.builder()
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
                .build();
    }


    public static String hmacSHA256(String data, String secretKey) {
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

    @Override
    public TreatmentRecordResponse processReturnUrl(HttpServletRequest request) {
        return null;
    }

    @Override
    public String getPaymentMethod() {
        return "MOMO";
    }
}
