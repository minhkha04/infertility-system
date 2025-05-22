package com.emmkay.infertility_system_api.helper;

import com.emmkay.infertility_system_api.entity.EmailOtp;
import com.emmkay.infertility_system_api.repository.EmailOtpRepository;
import com.emmkay.infertility_system_api.service.EmailService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Random;

@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OtpHelper {
    EmailOtpRepository emailOtpRepository;
    EmailService emailService;

    public  void generateAndSendOtp(String email,String type) {
        emailOtpRepository.deleteById(email);
        String otp = String.format("%06d", new Random().nextInt(999999));
        emailOtpRepository.save(EmailOtp.builder()
                .email(email)
                .otp(otp)
                .expiryTime(LocalDateTime.now().plusMinutes(5))
                .build());
        emailService.sendEmail(email, "OTP for " + type, "Your OTP is: " + otp + "\nIt is valid for 5 minutes.");
    }


}
