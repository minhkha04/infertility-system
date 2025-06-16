package com.emmkay.infertility_system_api.service.payment;

import com.emmkay.infertility_system_api.dto.response.TreatmentRecordResponse;
import com.emmkay.infertility_system_api.entity.TreatmentRecord;
import com.emmkay.infertility_system_api.helper.PaymentHelper;
import com.mservice.allinone.models.PaymentRequest;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class MomoPaymentStrategy implements PaymentStrategy {

    PaymentHelper paymentHelper;

    @Override
    public String createPaymentUrl(HttpServletRequest request, Long recordId) throws UnsupportedEncodingException {

        TreatmentRecord treatmentRecord = paymentHelper.isAvailable(recordId);
        String orderId = paymentHelper.getOrderId(recordId);
        String amount = treatmentRecord.getService().getPrice().multiply(new java.math.BigDecimal(100)).toBigInteger().toString();
        PaymentRequest paymentRequest = new PaymentRequest(
                "MOMO",
                orderId,
                "Thanh toan hoa don: " + orderId,
                "K951B6PE1waDMi640xX08PD3vg6EkVlz",
                amount,
                "",
                "",
                UUID.randomUUID().toString(),
                "",
                "http://localhost:8080/infertility-system-api/payment-momo/return",
                "captureWallet"
        );
        return "";
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
