package com.emmkay.infertility_system_api.modules.payment.controller;

import com.emmkay.infertility_system_api.modules.payment.dto.request.MomoIpnRequest;
import com.emmkay.infertility_system_api.modules.shared.dto.response.ApiResponse;
import com.emmkay.infertility_system_api.modules.treatment.dto.response.TreatmentRecordResponse;
import com.emmkay.infertility_system_api.modules.shared.helper.QrCodeHelper;
import com.emmkay.infertility_system_api.modules.payment.service.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.io.UnsupportedEncodingException;

@RequiredArgsConstructor
@RestController
@RequestMapping("/payment")
@FieldDefaults(makeFinal = true)
public class PaymentController {

    PaymentService paymentService;
    QrCodeHelper qrCodeHelper;

    @GetMapping("/vnpay/{recordId}")
    public ApiResponse<String> url(HttpServletRequest request, @PathVariable Long recordId) throws UnsupportedEncodingException {
        return ApiResponse.<String>builder()
                .result(paymentService.createPaymentUrl("VNPAY", request, recordId)).build();
    }

    @GetMapping("/vnpay/return")
    public ApiResponse<TreatmentRecordResponse> handleVnPayReturn(HttpServletRequest request) {
        return ApiResponse.<TreatmentRecordResponse>builder()
                .result(paymentService.processReturnUrl("VNPAY", request))
                .build();
    }

    @PostMapping("/momo/create/{recordId}")
    public ApiResponse<String> createQrMomo(@PathVariable Long recordId) throws UnsupportedEncodingException {
        String qrMomo = paymentService.createPaymentUrl("MOMO", null, recordId);
        String result = qrCodeHelper.generateQrBase64(qrMomo);
        return ApiResponse.<String>builder()
                .result(result)
                .build();
    }

    @PostMapping("/momo/ipn")
    public ApiResponse<TreatmentRecordResponse> handleMomoIpn(@RequestBody MomoIpnRequest request) {
        return ApiResponse.<TreatmentRecordResponse>builder()
                .result(paymentService.processReturnUrl("MOMO", request))
                .build();
    }

}
