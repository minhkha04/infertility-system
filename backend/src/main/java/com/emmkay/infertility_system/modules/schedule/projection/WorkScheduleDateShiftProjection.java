package com.emmkay.infertility_system.modules.schedule.projection;

import com.emmkay.infertility_system.modules.shared.enums.Shift;

import java.time.LocalDate;

public interface WorkScheduleDateShiftProjection {
    LocalDate getWorkDate();
    Shift getShift();
}
