package com.emmkay.infertility_system_api.modules.authentication.utils;

import com.emmkay.infertility_system_api.modules.authentication.entity.EmailOtp;
import com.emmkay.infertility_system_api.modules.shared.exception.AppException;
import com.emmkay.infertility_system_api.modules.shared.exception.ErrorCode;

import java.time.LocalDateTime;
import java.time.ZoneId;

public class OtpValidatorUtils {

    private OtpValidatorUtils() {
    }
    public static void verify(EmailOtp emailOtp, String otp) {

        if (!emailOtp.getOtp().equals(otp)) {
            throw new AppException(ErrorCode.OTP_INVALID);
        }
        if (emailOtp.getExpiryTime().isBefore(LocalDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh")))) {
            throw new AppException(ErrorCode.OTP_EXPIRED);
        }
    }
}
