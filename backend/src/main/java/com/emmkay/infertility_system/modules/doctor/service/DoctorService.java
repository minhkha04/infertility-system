package com.emmkay.infertility_system.modules.doctor.service;

import com.emmkay.infertility_system.modules.doctor.projection.DoctorBasicProjection;
import com.emmkay.infertility_system.modules.doctor.dto.request.DoctorUpdateRequest;
import com.emmkay.infertility_system.modules.doctor.dto.response.DoctorResponse;
import com.emmkay.infertility_system.modules.doctor.dto.response.DoctorWorkScheduleResponse;
import com.emmkay.infertility_system.modules.doctor.entity.Doctor;
import com.emmkay.infertility_system.modules.doctor.projection.DoctorSelectProjection;
import com.emmkay.infertility_system.modules.shared.enums.Shift;
import com.emmkay.infertility_system.modules.shared.security.CurrentUserUtils;
import com.emmkay.infertility_system.modules.user.entity.User;
import com.emmkay.infertility_system.modules.schedule.entity.WorkSchedule;
import com.emmkay.infertility_system.modules.shared.exception.AppException;
import com.emmkay.infertility_system.modules.shared.exception.ErrorCode;
import com.emmkay.infertility_system.modules.doctor.mapper.DoctorMapper;
import com.emmkay.infertility_system.modules.user.mapper.UserMapper;
import com.emmkay.infertility_system.modules.appointment.service.AppointmentService;
import com.emmkay.infertility_system.modules.doctor.repository.DoctorRepository;
import com.emmkay.infertility_system.modules.user.repository.UserRepository;
import com.emmkay.infertility_system.modules.schedule.repository.WorkScheduleRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class DoctorService {

    UserMapper userMapper;
    DoctorMapper doctorMapper;
    DoctorRepository doctorRepository;
    UserRepository userRepository;
    WorkScheduleRepository workScheduleRepository;
    AppointmentService appointmentService;

    public Page<DoctorBasicProjection> getPublicDoctors(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return doctorRepository.getPublicDoctors(pageable);
    }

    public DoctorResponse getDoctorById(String id, Boolean isPublic) {
        Doctor doctor = doctorRepository.findByIdAndIsPublic(id, isPublic)
                .orElseThrow(() -> new AppException(ErrorCode.DOCTOR_NOT_EXISTED));
        return doctorMapper.toDoctorResponse(doctor);
    }

    @PreAuthorize("#id == authentication.name")
    public DoctorResponse updateDoctor(String id, DoctorUpdateRequest request) {
        String currentUserId = CurrentUserUtils.getCurrentUserId();
        if (currentUserId == null || currentUserId.isBlank()) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        Doctor doctor = doctorRepository.findById(currentUserId)
                .orElseThrow(() -> new AppException(ErrorCode.DOCTOR_NOT_EXISTED));

        User user = userRepository.findById(doctor.getId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (userRepository.existsByEmailAndIdNot(request.getEmail(), doctor.getId())) {
            throw new AppException(ErrorCode.EMAIL_EXISTED);
        }
        userMapper.updateUser(user, request);
        doctorMapper.updateDoctor(doctor, request);

        userRepository.save(user);
        doctor.setIsPublic(true);
        Doctor updatedDoctor = doctorRepository.save(doctor);
        return doctorMapper.toDoctorResponse(updatedDoctor);
    }

    @PreAuthorize("hasRole('MANAGER')")
    public List<DoctorSelectProjection> getDoctorsToCreateSchedule() {
        return doctorRepository.searchDoctors(false, true);
    }

    public List<DoctorSelectProjection> getAvailableDoctors(LocalDate date, Shift shift) {
        LocalDate today = LocalDate.now();
        if (date.isBefore(today) || date.isAfter(today.plusDays(14))) {
            throw new AppException(ErrorCode.DATE_OUT_OF_RANGE);
        }

        List<Shift> shiftsToMatch = List.of(shift, Shift.FULL_DAY);
        List<DoctorSelectProjection> doctors = workScheduleRepository.getDoctorsForRegister(date, shiftsToMatch);
        return doctors.stream()
                .filter(doctor -> appointmentService.isDoctorAvailable(doctor.getId(), date, shift))
                .toList();
    }

    public DoctorWorkScheduleResponse getDoctorSchedule(String doctorId) {
        LocalDate from = LocalDate.now();
        List<WorkSchedule> schedules = workScheduleRepository
                .findByDoctorIdAndWorkDateGreaterThanEqual(doctorId, from);

        Map<String, List<Shift>> grouped = new LinkedHashMap<>();

        for (WorkSchedule ws : schedules) {
            LocalDate date = ws.getWorkDate();
            String dateKey = date.toString();

            List<Shift> availableShifts = new ArrayList<>();

            switch (ws.getShift()) {
                case MORNING, AFTERNOON:
                    if (appointmentService.isDoctorAvailable(doctorId, date, ws.getShift())) {
                        availableShifts.add(ws.getShift());
                    }
                    break;
                case FULL_DAY:
                    // Kiểm tra từng ca riêng biệt
                    if (appointmentService.isDoctorAvailable(doctorId, date, Shift.MORNING)) {
                        availableShifts.add(Shift.MORNING);
                    }
                    if (appointmentService.isDoctorAvailable(doctorId, date, Shift.AFTERNOON)) {
                        availableShifts.add(Shift.AFTERNOON);
                    }
                    break;
            }

            if (!availableShifts.isEmpty()) {
                grouped.computeIfAbsent(dateKey, k -> new ArrayList<>()).addAll(availableShifts);
            }
        }

        return DoctorWorkScheduleResponse.builder()
                .doctorId(doctorId)
                .from(from.toString())
                .schedules(grouped)
                .build();
    }

    public Optional<Doctor> findBestDoctor(LocalDate date, Shift shift) {
        return doctorRepository
                .findAvailableDoctorByDateAndShift(date, shift, PageRequest.of(0, 1))
                .stream()
                .findFirst();
    }

}
