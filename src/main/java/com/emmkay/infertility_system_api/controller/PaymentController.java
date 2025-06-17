package com.emmkay.infertility_system_api.controller;

import com.emmkay.infertility_system_api.dto.request.MomoIpnRequest;
import com.emmkay.infertility_system_api.dto.response.ApiResponse;
import com.emmkay.infertility_system_api.dto.response.MomoCreateResponse;
import com.emmkay.infertility_system_api.dto.response.TreatmentRecordResponse;
import com.emmkay.infertility_system_api.helper.QrCodeHelper;
import com.emmkay.infertility_system_api.service.PaymentService;
import com.emmkay.infertility_system_api.service.payment.MomoPaymentStrategy;
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
    MomoPaymentStrategy momoPaymentStrategy;
    QrCodeHelper qrCodeHelper;

    @GetMapping("/vnpay/{recordId}")
    public ApiResponse<String> url(HttpServletRequest request, @PathVariable Long recordId) throws UnsupportedEncodingException {
        return ApiResponse.<String>builder()
                .result(paymentService.createPaymentUrl("VNPAY",request, recordId)).build();
    }

    @GetMapping("/vnpay/return")
    public ApiResponse<TreatmentRecordResponse> handleVnPayReturn(HttpServletRequest request) {
        return ApiResponse.<TreatmentRecordResponse>builder()
                .result(paymentService.processReturnUrl("VNPAY",request))
                .build();
    }

    @PostMapping("/momo/create")
    public ApiResponse<MomoCreateResponse> test() {
//        String result = qrCodeHelper.generateQrBase64(momoPaymentStrategy.createQr());
        MomoCreateResponse result = momoPaymentStrategy.createQr();
        return ApiResponse.<MomoCreateResponse>builder()
                .result(result)
                    .build();
    }

    @PostMapping("/momo/ipn")
    public ApiResponse<TreatmentRecordResponse> handleMomoIpn(@RequestBody MomoIpnRequest request) {
        return ApiResponse.<TreatmentRecordResponse>builder()
                .result(momoPaymentStrategy.result(request))
                .build();
    }

}
