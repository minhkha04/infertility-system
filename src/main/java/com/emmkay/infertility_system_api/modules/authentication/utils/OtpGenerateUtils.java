package com.emmkay.infertility_system_api.modules.authentication.utils;

import java.security.SecureRandom;

public class OtpGenerateUtils {

    private OtpGenerateUtils() {
    }
    private static final SecureRandom random = new SecureRandom();

    public static String generate(int length) {
        String digits = "0123456789";
        StringBuilder otp = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            otp.append(digits.charAt(random.nextInt(digits.length())));
        }
        return otp.toString();
    }
}
