package com.emmkay.infertility_system_api.controller;

import com.emmkay.infertility_system_api.dto.response.ApiResponse;
import com.emmkay.infertility_system_api.service.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.UnsupportedEncodingException;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/payment")
@FieldDefaults(makeFinal = true)
public class PaymentController {

    PaymentService paymentService;

    @GetMapping("/qr")
    public ApiResponse<String> url(HttpServletRequest request) throws UnsupportedEncodingException {
        return ApiResponse.<String>builder()
                .result(paymentService.url(request)).build();
    }

}
