package com.emmkay.infertility_system_api.controller;

import com.emmkay.infertility_system_api.dto.request.AuthenticationRequest;
import com.emmkay.infertility_system_api.dto.request.IntrospectRequest;
import com.emmkay.infertility_system_api.dto.request.UserCreationRequest;
import com.emmkay.infertility_system_api.dto.response.ApiResponse;
import com.emmkay.infertility_system_api.dto.response.AuthenticationResponse;
import com.emmkay.infertility_system_api.dto.response.IntrospectResponse;
import com.emmkay.infertility_system_api.dto.response.UserResponse;
import com.emmkay.infertility_system_api.service.AuthenticationService;
import com.nimbusds.jose.JOSEException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.text.ParseException;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationController {
    AuthenticationService authenticationService;


    @PostMapping("/login")
    public ApiResponse<AuthenticationResponse> login(@RequestBody AuthenticationRequest request) throws JOSEException {
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
    public ApiResponse<IntrospectResponse> introspect(@RequestBody IntrospectRequest request) throws ParseException, JOSEException {
        return ApiResponse.<IntrospectResponse>builder()
                .result(authenticationService.introspect(request))
                .build();
    }
}
