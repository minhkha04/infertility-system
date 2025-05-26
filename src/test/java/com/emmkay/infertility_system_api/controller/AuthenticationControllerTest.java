package com.emmkay.infertility_system_api.controller;

import com.emmkay.infertility_system_api.dto.request.AuthenticationRequest;
import com.emmkay.infertility_system_api.dto.request.UserCreationRequest;
import com.emmkay.infertility_system_api.dto.response.AuthenticationResponse;
import com.emmkay.infertility_system_api.dto.response.RoleResponse;
import com.emmkay.infertility_system_api.dto.response.UserResponse;
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

import java.time.LocalDate;

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

    @Autowired
    private ObjectMapper objectMapper;


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
    void register_missingEmail() throws Exception {
        UserCreationRequest registerRequest = UserCreationRequest.builder()
                .username("newuser")
                .password("newpassword123")
                .email("")
                .fullName("New User")
                .build();

        mockMvc.perform(post("/auth/register")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(2000))
                .andExpect(jsonPath("$.message").value("This field is required"));
    }

    @Test
    void register_missingUsername() throws Exception {
        UserCreationRequest registerRequest = UserCreationRequest.builder()
                .username("")
                .password("newpassword123")
                .email("newuser@example.com")
                .fullName("New User")
                .build();

        mockMvc.perform(post("/auth/register")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(2000))
                .andExpect(jsonPath("$.message").value("This field is required"));
    }

    @Test
    void register_missingPassword() throws Exception {
        UserCreationRequest registerRequest = UserCreationRequest.builder()
                .username("newuser")
                .password("")
                .email("newuser@example.com")
                .fullName("New User")
                .build();

        mockMvc.perform(post("/auth/register")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(2000))
                .andExpect(jsonPath("$.message").value("This field is required"));
    }

    @Test
    void register_invalidEmailFormat() throws Exception {
        UserCreationRequest registerRequest = UserCreationRequest.builder()
                .username("newuser")
                .password("newpassword123")
                .email("invalid-email")
                .fullName("New User")
                .build();

        mockMvc.perform(post("/auth/register")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(2000));
    }

    @Test
    void register_success() throws Exception {
        UserCreationRequest registerRequest = UserCreationRequest.builder()
                .username("newuser")
                .password("newpassword123")
                .fullName("New User")
                .email("newuser@example.com")
                .phoneNumber("+84449617736")
                .gender("male")                         // tùy DTO: String hay Enum
                .dateOfBirth(LocalDate.parse("2025-05-24"))
                .address("123 Main St")
                .build();

        UserResponse userResponse = UserResponse.builder()
                .id("user-id-123")
                .username("newuser")
                .fullName("New User")
                .email("newuser@example.com")
                .phoneNumber("+84449617736")
                .gender("male")
                .dateOfBirth(LocalDate.parse("2025-05-24"))
                .address("123 Main St")
                .roleName(RoleResponse.builder()
                        .name("CUSTOMER")
                        .description("string")
                        .build())
                .build();

        Mockito.when(authenticationService.register(any(UserCreationRequest.class)))
                .thenReturn(userResponse);

        mockMvc.perform(post("/auth/register")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(1000))
                .andExpect(jsonPath("$.result.username").value("newuser"))
                .andExpect(jsonPath("$.result.email").value("newuser@example.com"))
                .andExpect(jsonPath("$.result.fullName").value("New User"));
    }

    @Test
    void register_emailAlreadyExists() throws Exception {
        UserCreationRequest registerRequest = UserCreationRequest.builder()
                .username("newuser")
                .password("newpassword123")
                .fullName("New User")
                .email("newuser@example.com")
                .phoneNumber("+84449617736")
                .gender("male")                         // tùy DTO: String hay Enum
                .dateOfBirth(LocalDate.parse("2025-05-24"))
                .address("123 Main St")
                .build();

        Mockito.when(authenticationService.register(any(UserCreationRequest.class)))
                .thenThrow(new AppException(ErrorCode.EMAIL_EXISTED));

        mockMvc.perform(post("/auth/register")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(ErrorCode.EMAIL_EXISTED.getCode()))
                .andExpect(jsonPath("$.message").value(ErrorCode.EMAIL_EXISTED.getMessage()));
    }

    @Test
    void register_usernameAlreadyExists() throws Exception {
        UserCreationRequest registerRequest = UserCreationRequest.builder()
                .username("newuser")
                .password("newpassword123")
                .fullName("New User")
                .email("newuser@example.com")
                .phoneNumber("+84449617736")
                .gender("male")                         // tùy DTO: String hay Enum
                .dateOfBirth(LocalDate.parse("2025-05-24"))
                .address("123 Main St")
                .build();

        Mockito.when(authenticationService.register(any(UserCreationRequest.class)))
                .thenThrow(new AppException(ErrorCode.USERNAME_EXISTED));

        mockMvc.perform(post("/auth/register")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(ErrorCode.USERNAME_EXISTED.getCode()))
                .andExpect(jsonPath("$.message").value(ErrorCode.USERNAME_EXISTED.getMessage()));
    }





}