package com.emmkay.infertility_system_api.modules.authentication.controller;

import com.emmkay.infertility_system_api.modules.shared.dto.response.ApiResponse;
import com.emmkay.infertility_system_api.modules.authentication.dto.request.*;
import com.emmkay.infertility_system_api.modules.authentication.dto.response.AuthenticationResponse;
import com.emmkay.infertility_system_api.modules.authentication.dto.response.IntrospectResponse;
import com.emmkay.infertility_system_api.modules.user.dto.request.UserCreateRequest;
import com.emmkay.infertility_system_api.modules.user.dto.response.UserResponse;
import com.emmkay.infertility_system_api.modules.authentication.service.AuthenticationService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;


@Slf4j
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationController {

    AuthenticationService authenticationService;

    @PostMapping("/login")
    public ApiResponse<AuthenticationResponse> login(@RequestBody @Valid AuthenticationRequest request) {
        return ApiResponse.<AuthenticationResponse>builder()
                .result(authenticationService.login(request))
                .build();
    }

    @PostMapping("/register")
    public ApiResponse<UserResponse> register(@RequestBody @Valid UserCreateRequest request) {
        return ApiResponse.<UserResponse>builder()
                .result(authenticationService.register(request))
                .build();
    }

    @PostMapping("/introspect")
    public ApiResponse<IntrospectResponse> introspect(@RequestBody @Valid IntrospectRequest request) {
        return ApiResponse.<IntrospectResponse>builder()
                .result(authenticationService.introspect(request))
                .build();
    }

    @PostMapping("/login-google")
    public ApiResponse<AuthenticationResponse> loginGoogle(@RequestBody @Valid GoogleLoginRequest request) {
        return ApiResponse.<AuthenticationResponse>builder()
                .result(authenticationService.loginGoogle(request))
                .build();
    }

    @PostMapping("/verify-otp")
    public ApiResponse<String> verifyOtp(@RequestBody @Valid VerifyOtpRequest request) {
        authenticationService.verifyOtp(request);
        return ApiResponse.<String>builder()
                .result("Email đã được xác thực")
                .build();
    }

    @PostMapping("/resend-otp")
    public ApiResponse<String> resendOtp(@RequestBody @Valid ResendOtpRequest request) {
        authenticationService.resendOtp(request.getEmail());
        return ApiResponse.<String>builder()
                .result("OTP đã được gửi đến email")
                .build();
    }

    @PostMapping("/forgot-password")
    public ApiResponse<String> forgotPassword(@RequestBody @Valid ForgotPasswordRequest request) {
        authenticationService.forgotPassword(request);
        return ApiResponse.<String>builder()
                .result("OTP đã được gửi đến email")
                .build();
    }

    @PostMapping("/reset-password")
    public ApiResponse<String> resetPassword(@RequestBody @Valid ResetPasswordRequest request) {
        authenticationService.resetPassword(request);
        return ApiResponse.<String>builder()
                .result("Thay đổi mật khẩu thành công")
                .build();
    }

    @PostMapping("/change-password")
    public ApiResponse<String> changePassword(@RequestBody @Valid ChangePasswordOtpRequest request) {
        authenticationService.changePassword(request);
        return ApiResponse.<String>builder()
                .result("OTP thay đổi mật khẩu đã được gửi đến email")
                .build();
    }

    @PostMapping("/refresh-token")
    public ApiResponse<AuthenticationResponse> refreshToken(@RequestBody @Valid RefreshTokenRequest request) {
        return ApiResponse.<AuthenticationResponse>builder()
                .result(authenticationService.refreshToken(request))
                .build();
    }
}
