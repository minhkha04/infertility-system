package com.emmkay.infertility_system.modules.shared.enums;

public enum Shift {
    MORNING,
    AFTERNOON,
    FULL_DAY;

    public static Shift from(String value) {
        return Shift.valueOf(value.toUpperCase());
    }
}
