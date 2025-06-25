package com.emmkay.infertility_system_api.modules.schedule.projection;

import java.time.LocalDate;

public interface WorkScheduleDateShiftProjection {
    LocalDate getWorkDate();
    String getShift();
}
