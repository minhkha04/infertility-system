package com.emmkay.infertility_system_api.modules.authentication.service;

import com.emmkay.infertility_system_api.modules.authentication.dto.request.*;
import com.emmkay.infertility_system_api.modules.authentication.dto.response.AuthenticationResponse;
import com.emmkay.infertility_system_api.modules.authentication.dto.response.IntrospectResponse;
import com.emmkay.infertility_system_api.modules.authentication.enums.OAuthProvider;
import com.emmkay.infertility_system_api.modules.authentication.utils.OtpGenerateUtils;
import com.emmkay.infertility_system_api.modules.authentication.utils.OtpValidatorUtils;
import com.emmkay.infertility_system_api.modules.authentication.utils.UserValidationUtils;
import com.emmkay.infertility_system_api.modules.email.dto.request.EmailRequest;
import com.emmkay.infertility_system_api.modules.email.enums.EmailType;
import com.emmkay.infertility_system_api.modules.email.service.EmailService;
import com.emmkay.infertility_system_api.modules.user.dto.request.UserCreateRequest;
import com.emmkay.infertility_system_api.modules.user.dto.response.UserResponse;
import com.emmkay.infertility_system_api.modules.authentication.entity.EmailOtp;
import com.emmkay.infertility_system_api.modules.user.entity.Role;
import com.emmkay.infertility_system_api.modules.user.entity.User;
import com.emmkay.infertility_system_api.modules.shared.exception.AppException;
import com.emmkay.infertility_system_api.modules.shared.exception.ErrorCode;
import com.emmkay.infertility_system_api.modules.shared.security.JwtProvider;
import com.emmkay.infertility_system_api.modules.user.mapper.UserMapper;
import com.emmkay.infertility_system_api.modules.authentication.repository.EmailOtpRepository;
import com.emmkay.infertility_system_api.modules.user.repository.RoleRepository;
import com.emmkay.infertility_system_api.modules.user.repository.UserRepository;
import com.nimbusds.jwt.SignedJWT;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.text.ParseException;
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
    JwtProvider jwtProvider;
    OAuthLoginService oAuthLoginService;
    EmailService emailService;

    public AuthenticationResponse loginWithOAuth(String accessToken, OAuthProvider provider) {
        return oAuthLoginService.login(provider, accessToken);
    }

    public AuthenticationResponse login(AuthenticationRequest request) {
        // find user by username
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        UserValidationUtils.validateUserIsActiveAndVerified(user);
        // check a user's password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new AppException(ErrorCode.PASSWORD_ERROR);
        }
        return AuthenticationResponse.builder()
                .token(jwtProvider.generateToken(user))
                .build();
    }

    public UserResponse register(UserCreateRequest request) {
        Optional<User> userOptional = userRepository.findByUsername(request.getUsername());
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            UserValidationUtils.validateUserIsActiveAndVerified(user);
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
        user.setAvatarUrl("https://res.cloudinary.com/di6hi1r0g/image/upload/v1749288955/default-avatar_qwb4ru.png");
        userRepository.save(user);
        String otp = OtpGenerateUtils.generate(6);
        EmailRequest emailRequest = EmailRequest.builder()
                .emailType(EmailType.OTP_VERIFICATION)
                .toEmail(request.getEmail())
                .params(Map.of(
                        "action", "đăng ký tài khoản",
                        "otp", otp
                ))
                .build();
        emailService.sendMail(emailRequest);
        return userMapper.toUserResponse(user);
    }

    public IntrospectResponse introspect(IntrospectRequest request) {
        boolean isValid = true;
        try {
            jwtProvider.verifyToken(request.getToken());
        } catch (AppException ex) {
            isValid = false;
        }

        return IntrospectResponse.builder()
                .valid(isValid)
                .build();
    }

    public void verifyOtp(VerifyOtpRequest request) {
        EmailOtp emailOtp = emailOtpRepository.findById(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.OTP_NOT_FOUND));
        OtpValidatorUtils.verify(emailOtp, request.getOtp());
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
        String otp = OtpGenerateUtils.generate(6);
        EmailRequest emailRequest = EmailRequest.builder()
                .emailType(EmailType.OTP_VERIFICATION)
                .toEmail(email)
                .params(Map.of(
                        "action", "xác thực tài khoản",
                        "otp", otp
                ))
                .build();
        emailService.sendMail(emailRequest);
    }

    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        UserValidationUtils.validateUserIsActiveAndVerified(user);
        String otp = OtpGenerateUtils.generate(6);
        EmailRequest emailRequest = EmailRequest.builder()
                .emailType(EmailType.OTP_VERIFICATION)
                .toEmail(request.getEmail())
                .params(Map.of(
                        "action", "quên mật khẩu",
                        "otp", otp
                ))
                .build();
        emailService.sendMail(emailRequest);
    }

    public void resetPassword(ResetPasswordRequest request) {
        EmailOtp emailOtp = emailOtpRepository.findById(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.OTP_NOT_FOUND));
        OtpValidatorUtils.verify(emailOtp, request.getOtp());

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);
        emailOtpRepository.deleteById(request.getEmail());
    }

    public void changePassword(ChangePasswordOtpRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        UserValidationUtils.validateUserIsActiveAndVerified(user);
        String otp = OtpGenerateUtils.generate(6);
        EmailRequest emailRequest = EmailRequest.builder()
                .emailType(EmailType.OTP_VERIFICATION)
                .toEmail(request.getEmail())
                .params(Map.of(
                        "action", "thay đổi mật khẩu",
                        "otp", otp
                ))
                .build();
        emailService.sendMail(emailRequest);
    }

    public AuthenticationResponse refreshToken(RefreshTokenRequest request) {
        SignedJWT signedJWT = jwtProvider.verifyToken(request.getToken());
        try {
            String userId = signedJWT.getJWTClaimsSet().getSubject();
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
            return AuthenticationResponse.builder()
                    .token(jwtProvider.generateToken(user))
                    .build();
        } catch (ParseException ex) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
    }
}

