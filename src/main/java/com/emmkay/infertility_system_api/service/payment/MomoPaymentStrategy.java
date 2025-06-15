package com.emmkay.infertility_system_api.service.payment;

import com.emmkay.infertility_system_api.dto.response.TreatmentRecordResponse;
import jakarta.servlet.http.HttpServletRequest;
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
public class MomoPaymentStrategy implements PaymentStrategy {
    @Override
    public String createPaymentUrl(HttpServletRequest request, Long recordId) throws UnsupportedEncodingException {
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
