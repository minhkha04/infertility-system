package com.emmkay.infertility_system_api.modules.payment.controller;

import com.emmkay.infertility_system_api.modules.payment.projection.PaymentInfoProjection;
import com.emmkay.infertility_system_api.modules.payment.service.PaymentTransactionService;
import com.emmkay.infertility_system_api.modules.shared.dto.response.ApiResponse;
import com.emmkay.infertility_system_api.modules.payment.service.PaymentService;
import com.emmkay.infertility_system_api.modules.shared.dto.response.PageResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/payments")
@FieldDefaults(level = AccessLevel.PRIVATE,makeFinal = true)
public class PaymentController {

    PaymentService paymentService;
    PaymentTransactionService paymentTransactionService;

    @PostMapping("/vnpay/create/{recordId}")
    public ApiResponse<String> url(HttpServletRequest request, @PathVariable Long recordId) {
        return ApiResponse.<String>builder()
                .result(paymentService.createPayment("VNPAY", request, recordId)).build();
    }

    @PostMapping("/momo/create/{recordId}")
    public ApiResponse<String> createQrMomo(@PathVariable Long recordId) {
        String result = paymentService.createPayment("MOMO", null, recordId);
        return ApiResponse.<String>builder()
                .result(result)
                .build();
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

    @GetMapping("/info")
    public ApiResponse<PageResponse<PaymentInfoProjection>> getPaymentInfo(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<PaymentInfoProjection> result = paymentTransactionService.getPaymentInfo(page, size);
        return ApiResponse.<PageResponse<PaymentInfoProjection>>builder()
                .result(PageResponse.from(result))
                .build();
    }

}
