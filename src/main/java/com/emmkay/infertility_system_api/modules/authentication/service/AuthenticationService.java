package com.emmkay.infertility_system_api.modules.authentication.service;

import com.emmkay.infertility_system_api.modules.authentication.dto.request.*;
import com.emmkay.infertility_system_api.modules.authentication.dto.response.AuthenticationResponse;
import com.emmkay.infertility_system_api.modules.authentication.dto.response.IntrospectResponse;
import com.emmkay.infertility_system_api.modules.authentication.utils.UsernameUtils;
import com.emmkay.infertility_system_api.modules.user.dto.request.UserCreateRequest;
import com.emmkay.infertility_system_api.modules.user.dto.response.UserResponse;
import com.emmkay.infertility_system_api.modules.authentication.entity.EmailOtp;
import com.emmkay.infertility_system_api.modules.user.entity.Role;
import com.emmkay.infertility_system_api.modules.user.entity.User;
import com.emmkay.infertility_system_api.modules.shared.exception.AppException;
import com.emmkay.infertility_system_api.modules.shared.exception.ErrorCode;
import com.emmkay.infertility_system_api.modules.authentication.helper.GoogleLoginHelper;
import com.emmkay.infertility_system_api.modules.shared.security.JwtHelper;
import com.emmkay.infertility_system_api.modules.authentication.helper.OtpHelper;
import com.emmkay.infertility_system_api.modules.user.mapper.UserMapper;
import com.emmkay.infertility_system_api.modules.authentication.repository.EmailOtpRepository;
import com.emmkay.infertility_system_api.modules.user.repository.RoleRepository;
import com.emmkay.infertility_system_api.modules.user.repository.UserRepository;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.nimbusds.jwt.SignedJWT;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.text.ParseException;
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
    GoogleLoginHelper googleTokenHelper;

    private void validateUserIsActiveAndVerified(User user) {
        if (user.getIsRemoved()) {
            throw new AppException(ErrorCode.USER_NOT_ACTIVE);
        }
        if (!user.getIsVerified()) {
            throw new AppException(ErrorCode.EMAIL_NOT_VERIFIED);
        }
    }

    private void validateOtp(String email, String otp) {
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
        log.info("Token: {}", request.getIdToken());

        GoogleIdToken.Payload payload = googleTokenHelper.verifyToken(request.getIdToken());
        String name = (String) payload.get("name");
        String email = payload.getEmail();
        String picture = (String) payload.get("picture");
        Optional<User> existingUserOpt = userRepository.findByEmail(email);
        User user;
        if (existingUserOpt.isPresent()) {
            user = existingUserOpt.get();
            user.setAvatarUrl(picture);
            userRepository.save(user);
            validateUserIsActiveAndVerified(user);
        } else {
            Role role = roleRepository.findById("CUSTOMER")
                    .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_EXISTED));
            user = User.builder()
                    .username(UsernameUtils.generateUsername(payload.get("given_name").toString()))
                    .fullName(name)
                    .email(email)
                    .isRemoved(false)
                    .password("")
                    .roleName(role)
                    .isVerified(true)
                    .avatarUrl(picture)
                    .build();
            userRepository.save(user);
        }
        String token = jwtHelper.generateToken(user);
        return AuthenticationResponse.builder()
                .token(token)
                .build();
    }

    public UserResponse register(UserCreateRequest request) {
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
        user.setAvatarUrl("https://res.cloudinary.com/di6hi1r0g/image/upload/v1749288955/default-avatar_qwb4ru.png");
        userRepository.save(user);
        otpHelper.generateAndSendOtp(request.getEmail(), "đăng ký tài khoản");
        return userMapper.toUserResponse(user);
    }

    public IntrospectResponse introspect(IntrospectRequest request) {
        boolean isValid = true;
        try {
            jwtHelper.verifyToken(request.getToken());
        } catch (AppException ex) {
            isValid = false;
        }

        return IntrospectResponse.builder()
                .valid(isValid)
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
        otpHelper.generateAndSendOtp(email, "xác thực");
    }

    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        validateUserIsActiveAndVerified(user);
        otpHelper.generateAndSendOtp(request.getEmail(), "thay đổi mật khẩu");
    }

    public void resetPassword(ResetPasswordRequest request) {
        validateOtp(request.getEmail(), request.getOtp());

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);
        emailOtpRepository.deleteById(request.getEmail());
    }

    public void changePassword(ChangePasswordOtpRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        validateUserIsActiveAndVerified(user);
        otpHelper.generateAndSendOtp(request.getEmail(), "thay đổi mật khẩu");
    }

    public AuthenticationResponse refreshToken(RefreshTokenRequest request) {
        SignedJWT signedJWT = jwtHelper.verifyToken(request.getToken());
        try {
            String userId = signedJWT.getJWTClaimsSet().getSubject();
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
            return AuthenticationResponse.builder()
                    .token(jwtHelper.generateToken(user))
                    .build();
        } catch (ParseException ex) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
    }
}

