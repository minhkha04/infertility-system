package com.emmkay.infertility_system_api.modules.payment.controller;

import com.emmkay.infertility_system_api.modules.payment.dto.request.MomoIpnRequest;
import com.emmkay.infertility_system_api.modules.payment.enums.PaymentMethod;
import com.emmkay.infertility_system_api.modules.payment.service.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/public/payments/callback")
@FieldDefaults(level = AccessLevel.PRIVATE,makeFinal = true)
public class PaymentCallbackController {

    PaymentService paymentService;

    @GetMapping("/vnpay")
    public ResponseEntity<String> handleVnPayIpn(HttpServletRequest request) {
        boolean success = paymentService.processReturnUrl(PaymentMethod.VNPAY, request);
        return ResponseEntity.ok(success ? "00" : "99");
    }

    @PostMapping("/momo")
    public ResponseEntity<String> handleMomoIpn(@RequestBody MomoIpnRequest request) {
        boolean success = paymentService.processReturnUrl(PaymentMethod.MOMO, request);
        return ResponseEntity.ok(success ? "0" : "1");
    }
}
