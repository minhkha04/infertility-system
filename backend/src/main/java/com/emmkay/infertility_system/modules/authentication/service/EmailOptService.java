package com.emmkay.infertility_system.modules.authentication.service;

import com.emmkay.infertility_system.modules.authentication.entity.EmailOtp;
import com.emmkay.infertility_system.modules.authentication.repository.EmailOtpRepository;
import com.emmkay.infertility_system.modules.authentication.utils.OtpValidatorUtils;
import com.emmkay.infertility_system.modules.shared.exception.AppException;
import com.emmkay.infertility_system.modules.shared.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;

@Service
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class EmailOptService {

    EmailOtpRepository emailOtpRepository;

    public void create(String email, String otp) {
        emailOtpRepository.deleteById(email);
        EmailOtp emailOtp = EmailOtp.builder()
                .email(email)
                .otp(otp)
                .expiryTime(LocalDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh")).plusMinutes(5L))
                .build();
        emailOtpRepository.save(emailOtp);
    }

    public void verifyOtp(String email, String otp) {
        EmailOtp emailOtp = emailOtpRepository.findById(email)
                .orElseThrow(() -> new AppException(ErrorCode.OTP_NOT_FOUND));
        OtpValidatorUtils.verify(emailOtp, otp);
        emailOtpRepository.deleteById(email);
    }
}
