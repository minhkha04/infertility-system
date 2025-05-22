package com.emmkay.infertility_system_api.controller;

import com.emmkay.infertility_system_api.dto.request.*;
import com.emmkay.infertility_system_api.dto.response.ApiResponse;
import com.emmkay.infertility_system_api.dto.response.AuthenticationResponse;
import com.emmkay.infertility_system_api.dto.response.IntrospectResponse;
import com.emmkay.infertility_system_api.dto.response.UserResponse;
import com.emmkay.infertility_system_api.service.AuthenticationService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@Slf4j
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationController {

    AuthenticationService authenticationService;

    @PostMapping("/login")
    public ApiResponse<AuthenticationResponse> login(@RequestBody AuthenticationRequest request) {
        return ApiResponse.<AuthenticationResponse>builder()
                .result(authenticationService.login(request))
                .build();
    }

    @PostMapping("/register")
    public ApiResponse<UserResponse> register(@RequestBody UserCreationRequest request) {
        return ApiResponse.<UserResponse>builder()
                .result(authenticationService.register(request))
                .build();
    }

    @PostMapping("/introspect")
    public ApiResponse<IntrospectResponse> introspect(@RequestBody IntrospectRequest request) {
        return ApiResponse.<IntrospectResponse>builder()
                .result(authenticationService.introspect(request))
                .build();
    }

    @PostMapping("/login-google")
    public ApiResponse<AuthenticationResponse> loginGoogle(@RequestBody GoogleLoginRequest request) {
        return ApiResponse.<AuthenticationResponse>builder()
                .result(authenticationService.loginGoogle(request))
                .build();
    }

    @PostMapping("/verify-otp")
    public ApiResponse<String> verifyOtp(@RequestBody VerifyOtpRequest request) {
        authenticationService.verifyOtp(request);
        return ApiResponse.<String>builder()
                .result("Email verified successfully!")
                .build();
    }

    @PostMapping("/resend-otp")
    public ApiResponse<String> resendOtp(@RequestBody ResendOtpRequest request) {
        authenticationService.resendOtp(request.getEmail());
        return ApiResponse.<String>builder()
                .result("OTP resent successfully!")
                .build();
    }

    @PostMapping("/forgot-password")
    public ApiResponse<String> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        authenticationService.forgotPassword(request);
        return ApiResponse.<String>builder()
                .result("OTP sent to your email!")
                .build();
    }

    @PostMapping("/reset-password")
    public ApiResponse<String> resetPassword(@RequestBody ResetPasswordRequest request) {
        authenticationService.resetPassword(request);
        return ApiResponse.<String>builder()
                .result("Password reset successfully!")
                .build();
    }

}
