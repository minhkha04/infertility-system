package com.emmkay.infertility_system_api.controller;

import com.emmkay.infertility_system_api.dto.request.AuthenticationRequest;
import com.emmkay.infertility_system_api.dto.response.AuthenticationResponse;
import com.emmkay.infertility_system_api.exception.AppException;
import com.emmkay.infertility_system_api.exception.ErrorCode;
import com.emmkay.infertility_system_api.service.AuthenticationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AuthenticationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AuthenticationService authenticationService;

    private AuthenticationRequest request;
    private AuthenticationResponse response;

    @BeforeEach
    void initData() {
        request = AuthenticationRequest.builder()
                .username("testuser")
                .password("testpassword")
                .build();

        response = AuthenticationResponse.builder()
                .token("testtoken")
                .build();
    }

    @Test
    void login_success() throws Exception {
        Mockito.when(authenticationService.login(any(AuthenticationRequest.class))).thenReturn(response);
        mockMvc.perform(post("/auth/login")
                        .contentType("application/json")
                        .content(new ObjectMapper().writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(1000))
                .andExpect(jsonPath("$.result.token").value("testtoken"));
    }

    @Test
    void login_missingUsername() throws Exception {
        request.setUsername("");
        mockMvc.perform(post("/auth/login")
                        .contentType("application/json")
                        .content(new ObjectMapper().writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(2000))
                .andExpect(jsonPath("$.message").value("This field is required"));
    }

    @Test
    void login_missingPassword() throws Exception {
        request.setPassword("");
        mockMvc.perform(post("/auth/login")
                        .contentType("application/json")
                        .content(new ObjectMapper().writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(2000))
                .andExpect(jsonPath("$.message").value("This field is required"));
    }

    @Test
    void login_wrongPassword() throws Exception {
        Mockito.when(authenticationService.login(any(AuthenticationRequest.class)))
                .thenThrow(new AppException(ErrorCode.PASSWORD_ERROR));

        mockMvc.perform(post("/auth/login")
                        .contentType("application/json")
                        .content(new ObjectMapper().writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(ErrorCode.PASSWORD_ERROR.getCode()))
                .andExpect(jsonPath("$.message").value(ErrorCode.PASSWORD_ERROR.getMessage()));
    }

    @Test
    void login_userNotFound() throws Exception {
        Mockito.when(authenticationService.login(any(AuthenticationRequest.class)))
                .thenThrow(new AppException(ErrorCode.USER_NOT_EXISTED));

        mockMvc.perform(post("/auth/login")
                        .contentType("application/json")
                        .content(new ObjectMapper().writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value(ErrorCode.USER_NOT_EXISTED.getCode()))
                .andExpect(jsonPath("$.message").value(ErrorCode.USER_NOT_EXISTED.getMessage()));
    }

    @Test
    void login_isNotVerified() throws Exception {
        Mockito.when(authenticationService.login(any(AuthenticationRequest.class)))
                .thenThrow(new AppException(ErrorCode.EMAIL_NOT_VERIFIED));

        mockMvc.perform(post("/auth/login")
                        .contentType("application/json")
                        .content(new ObjectMapper().writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(ErrorCode.EMAIL_NOT_VERIFIED.getCode()))
                .andExpect(jsonPath("$.message").value(ErrorCode.EMAIL_NOT_VERIFIED.getMessage()));
    }

    @Test
    void login_isRemoved() throws Exception {
        Mockito.when(authenticationService.login(any(AuthenticationRequest.class)))
                .thenThrow(new AppException(ErrorCode.USER_NOT_ACTIVE));

        mockMvc.perform(post("/auth/login")
                        .contentType("application/json")
                        .content(new ObjectMapper().writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value(ErrorCode.USER_NOT_ACTIVE.getCode()))
                .andExpect(jsonPath("$.message").value(ErrorCode.USER_NOT_ACTIVE.getMessage()));
    }

    @Test
    void register() {
    }
}