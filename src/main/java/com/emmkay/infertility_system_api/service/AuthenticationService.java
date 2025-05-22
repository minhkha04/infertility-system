package com.emmkay.infertility_system_api.service;

import com.emmkay.infertility_system_api.dto.request.*;
import com.emmkay.infertility_system_api.dto.response.AuthenticationResponse;
import com.emmkay.infertility_system_api.dto.response.IntrospectResponse;
import com.emmkay.infertility_system_api.dto.response.UserResponse;
import com.emmkay.infertility_system_api.entity.EmailOtp;
import com.emmkay.infertility_system_api.entity.Role;
import com.emmkay.infertility_system_api.entity.User;
import com.emmkay.infertility_system_api.exception.AppException;
import com.emmkay.infertility_system_api.exception.ErrorCode;
import com.emmkay.infertility_system_api.helper.GoogleTokenHelper;
import com.emmkay.infertility_system_api.helper.JwtHelper;
import com.emmkay.infertility_system_api.helper.OtpHelper;
import com.emmkay.infertility_system_api.mapper.UserMapper;
import com.emmkay.infertility_system_api.repository.EmailOtpRepository;
import com.emmkay.infertility_system_api.repository.RoleRepository;
import com.emmkay.infertility_system_api.repository.UserRepository;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationService {

    UserRepository userRepository;
    RoleRepository roleRepository;
    UserMapper userMapper;
    EmailOtpRepository emailOtpRepository;
    PasswordEncoder passwordEncoder;
    OtpHelper otpHelper;
    JwtHelper jwtHelper;
    GoogleTokenHelper googleTokenHelper;

    void validateUserIsActiveAndVerified(User user) {
        if (user.getIsRemoved()) {
            throw new AppException(ErrorCode.USER_NOT_ACTIVE);
        }
        if (!user.getIsVerified()) {
            throw new AppException(ErrorCode.EMAIL_NOT_VERIFIED);
        }
    }

    void validateOtp(String email, String otp) {
        EmailOtp emailOtp = emailOtpRepository.findById(email)
                .orElseThrow(() -> new AppException(ErrorCode.OTP_NOT_FOUND));
        if (!emailOtp.getOtp().equals(otp)) {
            throw new AppException(ErrorCode.OTP_INVALID);
        }
        if (emailOtp.getExpiryTime().isBefore(LocalDateTime.now())) {
            throw new AppException(ErrorCode.OTP_EXPIRED);
        }
    }

    public AuthenticationResponse login(AuthenticationRequest request) {
        // find user by username
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        validateUserIsActiveAndVerified(user);
        // check a user's password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new AppException(ErrorCode.PASSWORD_ERROR);
        }
        return AuthenticationResponse.builder()
                .token(jwtHelper.generateToken(user))
                .build();
    }

    public AuthenticationResponse loginGoogle(GoogleLoginRequest request) {
        GoogleIdToken.Payload payload = googleTokenHelper.verifyToken(request.getIdToken());
        String name = (String) payload.get("name");
        String email = payload.getEmail();
        Optional<User> existingUserOpt = userRepository.findByEmail(email);
        User user;
        if (existingUserOpt.isPresent()) {
            user = existingUserOpt.get();
            validateUserIsActiveAndVerified(user);
        } else {
            Role role = roleRepository.findById("CUSTOMER")
                    .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_EXISTED));
            user = User.builder()
                    .username(email)
                    .fullName(name)
                    .email(email)
                    .isRemoved(false)
                    .password("")
                    .roleName(role)
                    .isVerified(true)
                    .build();
            userRepository.save(user);
        }
        String token = jwtHelper.generateToken(user);
        log.info(token);
        return AuthenticationResponse.builder()
                .token(token)
                .build();
    }

    public UserResponse register(UserCreationRequest request) {
        Optional<User> userOptional = userRepository.findByUsername(request.getUsername());
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            validateUserIsActiveAndVerified(user);
            throw new AppException(ErrorCode.USERNAME_EXISTED);
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_EXISTED);
        }
        User user = userMapper.toUser(request);
        Role role = roleRepository.findById("CUSTOMER").orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_EXISTED));
        user.setRoleName(role);
        user.setIsRemoved(false);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setIsVerified(false);
        userRepository.save(user);
        otpHelper.generateAndSendOtp(request.getEmail(), "register");
        return userMapper.toUserResponse(user);
    }

    public IntrospectResponse introspect(IntrospectRequest request) {
        return IntrospectResponse.builder()
                .valid(jwtHelper.verifyToken(request.getToken()))
                .build();
    }

    public void verifyOtp(VerifyOtpRequest request) {
        validateOtp(request.getEmail(), request.getOtp());
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        user.setIsVerified(true);
        userRepository.save(user);
        emailOtpRepository.deleteById(request.getEmail());
    }

    public void resendOtp(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (user.getIsVerified()) {
            throw new AppException(ErrorCode.USER_ALREADY_ACTIVE);
        }
        otpHelper.generateAndSendOtp(email, "verify");
    }

    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        validateUserIsActiveAndVerified(user);
        otpHelper.generateAndSendOtp(request.getEmail(), "reset password");
    }

    public void resetPassword(ResetPasswordRequest request) {
        validateOtp(request.getEmail(), request.getOtp());

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);
        emailOtpRepository.deleteById(request.getEmail());
    }
}

