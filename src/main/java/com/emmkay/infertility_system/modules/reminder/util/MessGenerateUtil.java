package com.emmkay.infertility_system.modules.reminder.util;

import com.emmkay.infertility_system.modules.doctor.entity.Doctor;
import com.emmkay.infertility_system.modules.shared.enums.Shift;
import com.emmkay.infertility_system.modules.shared.exception.AppException;
import com.emmkay.infertility_system.modules.shared.exception.ErrorCode;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

public class MessGenerateUtil {

    private MessGenerateUtil() {
    }

    private static String generateShift(Shift shift) {
        return switch (shift) {
            case MORNING -> "sáng";
            case AFTERNOON -> "chiều";
            default -> throw new AppException(ErrorCode.INVALID_SHIFT_VALUE);
        };
    }

    public static String buildMess(Doctor doctor, Shift shift, LocalDate date, String step) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("EEEE, 'ngày' d 'tháng' M, yyyy", new Locale("vi", "VN"));
        String formattedDate = date.format(formatter);
        return "Bạn có lịch hẹn với bác sĩ <strong>" + doctor.getUsers().getFullName() +
                "</strong> vào <strong>" + formattedDate + "</strong> buổi <strong>" + generateShift(shift) +
                "</strong> cho việc <strong>" + step + "</strong>.";
    }
}
