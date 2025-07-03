package com.emmkay.infertility_system.modules.authentication.utils;

public class UsernameUtils {

    private UsernameUtils() {}

    public static String generateUsername(String name) {
        String normalized = java.text.Normalizer.normalize(name, java.text.Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "")
                .replaceAll("đ", "d")
                .replaceAll("Đ", "D");
        String cleanName = normalized.toLowerCase().replaceAll("\\s+", "_");
        String timestamp = String.valueOf(System.currentTimeMillis());
        return cleanName + "_" + timestamp;
    }
}
