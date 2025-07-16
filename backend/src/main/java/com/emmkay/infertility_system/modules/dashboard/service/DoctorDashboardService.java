package com.emmkay.infertility_system.modules.dashboard.service;

import com.emmkay.infertility_system.modules.appointment.repository.AppointmentRepository;
import com.emmkay.infertility_system.modules.dashboard.projection.DoctorTodayAppointmentProjection;
import com.emmkay.infertility_system.modules.dashboard.repository.DoctorDashboardRepository;
import com.emmkay.infertility_system.modules.dashboard.view.DoctorDashboardOverview;
import com.emmkay.infertility_system.modules.schedule.projection.WorkScheduleDateShiftProjection;
import com.emmkay.infertility_system.modules.schedule.repository.WorkScheduleRepository;
import com.emmkay.infertility_system.modules.shared.exception.AppException;
import com.emmkay.infertility_system.modules.shared.exception.ErrorCode;
import com.emmkay.infertility_system.modules.shared.security.CurrentUserUtils;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class DoctorDashboardService {

    DoctorDashboardRepository doctorDashboardRepository;
    AppointmentRepository appointmentRepository;
    WorkScheduleRepository workScheduleRepository;


    public DoctorDashboardOverview getOverview() {
        String currentUserId = CurrentUserUtils.getCurrentUserId();
        if (currentUserId == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        return doctorDashboardRepository.findById(currentUserId)
                .orElseThrow(() -> new AppException(ErrorCode.DOCTOR_NOT_EXISTED));
    }

    public Page<DoctorTodayAppointmentProjection> getTodayAppointments(int page, int size) {
        String currentUserId = CurrentUserUtils.getCurrentUserId();
        if (currentUserId == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        Pageable pageable = PageRequest.of(page, size);
        LocalDate today = LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh"));
        return appointmentRepository.findTodayAppointmentsByDoctorId(currentUserId, today, pageable);
    }

    public List<WorkScheduleDateShiftProjection> getWorkScheduleByDoctorId(YearMonth yearMonth) {
        String currentUserId = CurrentUserUtils.getCurrentUserId();
        if (currentUserId == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        LocalDate firstDayOfMonth = yearMonth.atDay(1);
        LocalDate lastDayOfMonth = yearMonth.atEndOfMonth();
        return workScheduleRepository.findAllByDoctorIdAndWorkDateBetweenOrderByWorkDateAsc(currentUserId, firstDayOfMonth, lastDayOfMonth);
    }
}
