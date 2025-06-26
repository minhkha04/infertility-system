package com.emmkay.infertility_system_api.modules.schedule.service;

import com.emmkay.infertility_system_api.modules.schedule.dto.request.BulkWorkScheduleRequest;
import com.emmkay.infertility_system_api.modules.schedule.dto.request.WorkScheduleCreateRequest;
import com.emmkay.infertility_system_api.modules.schedule.dto.request.WorkScheduleUpdateRequest;
import com.emmkay.infertility_system_api.modules.schedule.dto.response.WorkScheduleResponse;
import com.emmkay.infertility_system_api.modules.doctor.entity.Doctor;
import com.emmkay.infertility_system_api.modules.schedule.projection.WorkScheduleDateShiftProjection;
import com.emmkay.infertility_system_api.modules.user.entity.User;
import com.emmkay.infertility_system_api.modules.schedule.entity.WorkSchedule;
import com.emmkay.infertility_system_api.modules.shared.exception.AppException;
import com.emmkay.infertility_system_api.modules.shared.exception.ErrorCode;
import com.emmkay.infertility_system_api.modules.schedule.mapper.WorkScheduleMapper;
import com.emmkay.infertility_system_api.modules.doctor.repository.DoctorRepository;
import com.emmkay.infertility_system_api.modules.user.repository.UserRepository;
import com.emmkay.infertility_system_api.modules.schedule.repository.WorkScheduleRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class WorkScheduleService {

    WorkScheduleRepository workScheduleRepository;
    WorkScheduleMapper workScheduleMapper;
    UserRepository userRepository;
    DoctorRepository doctorRepository;

    @PreAuthorize("hasRole('MANAGER')")
    public WorkScheduleResponse createWorkSchedule(WorkScheduleCreateRequest request) {
        if (workScheduleRepository.existsByDoctorIdAndWorkDateAndShift(
                request.getDoctorId(), request.getWorkDate(), request.getShift())) {
            throw new AppException(ErrorCode.WORK_SCHEDULE_EXISTED);
        }

        User manager = userRepository.findById(request.getCreatedBy())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new AppException(ErrorCode.DOCTOR_NOT_EXISTED));

        WorkSchedule workSchedule = workScheduleMapper.toWorkSchedule(request);
        workSchedule.setCreatedAt(LocalDateTime.now());
        workSchedule.setCreatedBy(manager);
        workSchedule.setDoctor(doctor);
        workSchedule.setShift(workSchedule.getShift());
        return workScheduleMapper.toWorkScheduleResponse(workScheduleRepository.save(workSchedule));
    }

    @PreAuthorize("hasRole('MANAGER')")
    public WorkScheduleResponse updateWorkSchedule(WorkScheduleUpdateRequest request, String doctorId) {
        WorkSchedule workSchedule = workScheduleRepository.findByDoctorIdAndWorkDate(doctorId, request.getWorkDate())
                .orElseThrow(() -> new AppException(ErrorCode.WORK_SCHEDULE_NOT_EXISTED));

        workScheduleMapper.updateWorkSchedule(workSchedule, request);
        workSchedule.setShift(workSchedule.getShift());
        return workScheduleMapper.toWorkScheduleResponse(workScheduleRepository.save(workSchedule));
    }


    @PreAuthorize("hasRole('MANAGER') or #id == authentication.name")
    public List<WorkScheduleDateShiftProjection> getWorkScheduleByMonthAndByDoctorId(String id, String yearMonth) {
        YearMonth yearMonthObj = YearMonth.parse(yearMonth);

        LocalDate firstDayOfMonth = yearMonthObj.atDay(1);
        LocalDate lastDayOfMonth = yearMonthObj.atEndOfMonth();

        return workScheduleRepository.findAllByDoctorIdAndWorkDateBetweenOrderByWorkDateAsc(id, firstDayOfMonth, lastDayOfMonth);

    }

    @Transactional
    @PreAuthorize("hasRole('MANAGER')")
    public int bulkCreateMonthlySchedule(BulkWorkScheduleRequest request) {
        YearMonth yearMonth = YearMonth.parse(request.getMonth()); // "2025-06"
        LocalDate start = yearMonth.atDay(1);
        LocalDate end = yearMonth.atEndOfMonth();

        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new AppException(ErrorCode.DOCTOR_NOT_EXISTED));

        User manager = userRepository.findById(request.getCreatedBy())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        workScheduleRepository.deleteSchedulesByDoctorIdAndMonth(doctor.getId(), start, end);
        List<WorkSchedule> schedules = new ArrayList<>();

        for (LocalDate date = start; !date.isAfter(end); date = date.plusDays(1)) {
            String weekday = date.getDayOfWeek().name(); // "MONDAY"

            for (BulkWorkScheduleRequest.ShiftRule rule : request.getRules()) {
                if (rule.getWeekday().equalsIgnoreCase(weekday)) {

                    WorkSchedule schedule = WorkSchedule.builder()
                            .doctor(doctor)
                            .workDate(date)
                            .shift(rule.getShift())
                            .createdBy(manager)
                            .createdAt(LocalDateTime.now())
                            .build();

                    schedules.add(schedule);
                }
            }
        }

        // Save all
        workScheduleRepository.saveAll(schedules);

        return schedules.size(); // trả về số lịch đã tạo
    }


    @PreAuthorize("hasRole('MANAGER')")
    public void deleteWorkScheduleByDateAndDoctor(LocalDate date, String doctorId) {
        WorkSchedule schedule = workScheduleRepository.findByWorkDateAndDoctorId(date, doctorId)
                .orElseThrow(() -> new AppException(ErrorCode.WORK_SCHEDULE_NOT_EXISTED));
        workScheduleRepository.delete(schedule);
    }


}
