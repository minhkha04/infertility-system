package com.emmkay.infertility_system_api.modules.shared.helper;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TreatmentStageHelper {

    public static LocalDate[] calculateDateRangeFromCd1(String range, LocalDate cd1) {
        if (range == null || cd1 == null) {
            return new LocalDate[] { null, null };
        }
        range = range.trim();
        if (range.startsWith("CD")) {
            String normalized = range.replace("–", "-").replace("CD", "");
            String[] parts = normalized.split("-");
            int fromDay = Integer.parseInt(parts[0].trim());
            int toDay = Integer.parseInt(parts[1].trim());
            return new LocalDate[] { cd1.plusDays(fromDay - 1), cd1.plusDays(toDay - 1) };
        }
        return new LocalDate[] { null, null };
    }
}
