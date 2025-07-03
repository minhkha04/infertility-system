package com.emmkay.infertility_system.modules.payment.controller;

import com.emmkay.infertility_system.modules.payment.dto.request.MomoIpnRequest;
import com.emmkay.infertility_system.modules.payment.enums.PaymentMethod;
import com.emmkay.infertility_system.modules.payment.service.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/public/payments/callback")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PaymentCallbackController {

    PaymentService paymentService;

    @GetMapping("/vnpay")
    public ResponseEntity<String> handleVnPayIpn(HttpServletRequest request) {
        boolean success = paymentService.processReturnUrl(PaymentMethod.VNPAY, request);
        return ResponseEntity.ok(success ? "00" : "99");
    }

    @PostMapping("/momo")
    public ResponseEntity handleMomoIpn(@RequestBody MomoIpnRequest request) {
        paymentService.processReturnUrl(PaymentMethod.MOMO, request);
        return ResponseEntity.status(HttpStatusCode.valueOf(204)).build();
    }
}
