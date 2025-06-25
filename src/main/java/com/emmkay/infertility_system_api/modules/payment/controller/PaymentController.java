package com.emmkay.infertility_system_api.modules.payment.controller;

import com.emmkay.infertility_system_api.modules.payment.dto.request.MomoIpnRequest;
import com.emmkay.infertility_system_api.modules.payment.service.PaymentTransactionService;
import com.emmkay.infertility_system_api.modules.shared.dto.response.ApiResponse;
import com.emmkay.infertility_system_api.modules.payment.service.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.UnsupportedEncodingException;

@RequiredArgsConstructor
@RestController
@RequestMapping("/payment")
@FieldDefaults(makeFinal = true)
public class PaymentController {

    PaymentService paymentService;
    PaymentTransactionService paymentTransactionService;

    @PostMapping("/vnpay/create/{recordId}")
    public ApiResponse<String> url(HttpServletRequest request, @PathVariable Long recordId) throws UnsupportedEncodingException {
        return ApiResponse.<String>builder()
                .result(paymentService.createPayment("VNPAY", request, recordId)).build();
    }

    @GetMapping("/vnpay/ipn")
    public ResponseEntity<String> handleVnPayIpn(HttpServletRequest request) {
        boolean success = paymentService.processReturnUrl("VNPAY", request);
        return ResponseEntity.ok(success ? "00" : "99");
    }

    @PostMapping("/momo/create/{recordId}")
    public ApiResponse<String> createQrMomo(@PathVariable Long recordId) throws UnsupportedEncodingException {
        String result = paymentService.createPayment("MOMO", null, recordId);
        return ApiResponse.<String>builder()
                .result(result)
                .build();
    }

    @PostMapping("/momo/ipn")
    public ResponseEntity<String> handleMomoIpn(@RequestBody MomoIpnRequest request) {
        boolean success = paymentService.processReturnUrl("MOMO", request);
        return ResponseEntity.ok(success ? "0" : "1");
    }

    @PostMapping("/momo/reload/{recordId}")
    public ApiResponse<String> reloadMomo(@PathVariable Long recordId) {
        String result = paymentService.reloadPayment("MOMO", null, recordId);
        return ApiResponse.<String>builder()
                .result(result)
                .build();
    }

    @GetMapping("/result/{recordId}")
    public ApiResponse<Boolean> result(@PathVariable Long recordId) {
        return ApiResponse.<Boolean>builder()
                .result(paymentTransactionService.isPaid(recordId))
                .build();
    }

    @DeleteMapping("/cancelled/{recordId}")
    public  ApiResponse<Void> cancelled(@PathVariable Long recordId) {
        paymentTransactionService.cancelled(recordId);
        return ApiResponse.<Void>builder().build();
    }

}
