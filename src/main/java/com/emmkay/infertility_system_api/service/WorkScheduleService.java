package com.emmkay.infertility_system_api.service;

import com.emmkay.infertility_system_api.dto.request.BulkWorkScheduleRequest;
import com.emmkay.infertility_system_api.dto.request.WorkScheduleCreationRequest;
import com.emmkay.infertility_system_api.dto.request.WorkScheduleUpdateRequest;
import com.emmkay.infertility_system_api.dto.response.WorkScheduleResponse;
import com.emmkay.infertility_system_api.dto.response.WorkScheduleMonthlyResponse;
import com.emmkay.infertility_system_api.entity.Doctor;
import com.emmkay.infertility_system_api.entity.User;
import com.emmkay.infertility_system_api.entity.WorkSchedule;
import com.emmkay.infertility_system_api.exception.AppException;
import com.emmkay.infertility_system_api.exception.ErrorCode;
import com.emmkay.infertility_system_api.mapper.WorkScheduleMapper;
import com.emmkay.infertility_system_api.repository.DoctorRepository;
import com.emmkay.infertility_system_api.repository.UserRepository;
import com.emmkay.infertility_system_api.repository.WorkScheduleRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;


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
    public WorkScheduleResponse createWorkSchedule(WorkScheduleCreationRequest request) {
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

        return workScheduleMapper.toWorkScheduleResponse(workScheduleRepository.save(workSchedule));
    }

    @PreAuthorize("hasRole('MANAGER')")
    public WorkScheduleResponse updateWorkSchedule(Long id, WorkScheduleUpdateRequest request) {
        WorkSchedule workSchedule = workScheduleRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.WORK_SCHEDULE_NOT_EXISTED));
        workScheduleMapper.updateWorkSchedule(workSchedule, request);
        return workScheduleMapper.toWorkScheduleResponse(workScheduleRepository.save(workSchedule));
    }

    @PreAuthorize("hasRole('MANAGER') or #id == authentication.name")
    public WorkScheduleMonthlyResponse getWorkScheduleThisMonthByDoctorId(String id) {
        LocalDate firstDayOfMonth = LocalDate.now().withDayOfMonth(1);
        LocalDate lastDayOfMonth = firstDayOfMonth.withDayOfMonth(firstDayOfMonth.lengthOfMonth());

        List<WorkSchedule> schedules = workScheduleRepository.findAllByDoctorIdAndWorkDateBetweenOrderByWorkDateAsc(id, firstDayOfMonth, lastDayOfMonth);

        Map<String, String> scheduleMap = schedules.stream()
                .collect(Collectors.toMap(
                        s -> s.getWorkDate().toString(), // key: "2025-06-05"
                        WorkSchedule::getShift,          // value: "morning"
                        (existing, replacement) -> replacement // nếu trùng ngày thì lấy cái sau
                ));

        return WorkScheduleMonthlyResponse.builder()
                .doctorId(id)
                .month(firstDayOfMonth.toString().substring(0, 7)) // "2025-06"
                .schedules(scheduleMap)
                .build();
    }

    @PreAuthorize("hasRole('MANAGER')")
    public int bulkCreateMonthlySchedule(BulkWorkScheduleRequest request) {
        YearMonth yearMonth = YearMonth.parse(request.getMonth()); // "2025-06"
        LocalDate start = yearMonth.atDay(1);
        LocalDate end = yearMonth.atEndOfMonth();

        List<WorkSchedule> schedules = new ArrayList<>();

        for (LocalDate date = start; !date.isAfter(end); date = date.plusDays(1)) {
            String weekday = date.getDayOfWeek().name(); // "MONDAY"

            for (BulkWorkScheduleRequest.ShiftRule rule : request.getRules()) {
                if (rule.getWeekday().equalsIgnoreCase(weekday)) {
                    Doctor doctor = doctorRepository.findById(request.getDoctorId())
                            .orElseThrow(() -> new AppException(ErrorCode.DOCTOR_NOT_EXISTED));
                    User manager = userRepository.findById(request.getCreatedBy())
                            .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
                    WorkSchedule schedule = WorkSchedule.builder()
                            .doctor(doctor)
                            .workDate(date)
                            .shift(rule.getShift())
                            .createdBy(manager)
                            .build();

                    schedules.add(schedule);
                }
            }
        }

        // Remove duplicates (nếu đã tồn tại doctorId + date + shift)
        schedules.removeIf(s -> workScheduleRepository
                .existsByDoctorIdAndWorkDateAndShift(s.getDoctor().getId(), s.getWorkDate(), s.getShift()));

        // Save all
        workScheduleRepository.saveAll(schedules);

        return schedules.size(); // trả về số lịch đã tạo
    }

    @PreAuthorize("hasRole('MANAGER')")
    public void deleteWorkSchedule(Long id) {
        WorkSchedule schedule = workScheduleRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.WORK_SCHEDULE_NOT_EXISTED));

        workScheduleRepository.delete(schedule);
    }

}
