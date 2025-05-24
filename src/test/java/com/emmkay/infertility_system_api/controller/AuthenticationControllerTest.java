package com.emmkay.infertility_system_api.controller;

import com.emmkay.infertility_system_api.dto.request.AuthenticationRequest;
import com.emmkay.infertility_system_api.dto.response.AuthenticationResponse;
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
    void register() {
    }
}