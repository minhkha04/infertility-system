package com.emmkay.infertility_system_api.controller;

import com.emmkay.infertility_system_api.dto.response.ApiResponse;
import com.emmkay.infertility_system_api.dto.response.TreatmentRecordResponse;
import com.emmkay.infertility_system_api.service.PaymentService;
import com.emmkay.infertility_system_api.service.VnPayService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.UnsupportedEncodingException;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/payment")
@FieldDefaults(makeFinal = true)
public class PaymentController {

//    PaymentService paymentService;
    VnPayService paymentService;
    @GetMapping("/vnpay/{recordId}")
    public ApiResponse<String> url(HttpServletRequest request, @PathVariable Long recordId) throws UnsupportedEncodingException {
        return ApiResponse.<String>builder()
                .result(paymentService.createPaymentUrl("VNPAY",request, recordId)).build();
    }

    @GetMapping("/vnpay-return")
    public ApiResponse<TreatmentRecordResponse> handleVnPayReturn(HttpServletRequest request) {
        return ApiResponse.<TreatmentRecordResponse>builder()
                .result(paymentService.processReturnUrl("VNPAY",request))
                .build();
    }

}
