package com.emmkay.infertility_system_api.service;

import com.emmkay.infertility_system_api.dto.projection.DoctorDashboardProjection;
import com.emmkay.infertility_system_api.dto.request.DoctorUpdateRequest;
import com.emmkay.infertility_system_api.dto.response.DoctorDashboardResponse;
import com.emmkay.infertility_system_api.dto.response.DoctorRatingResponse;
import com.emmkay.infertility_system_api.dto.response.DoctorResponse;
import com.emmkay.infertility_system_api.dto.response.DoctorWorkScheduleResponse;
import com.emmkay.infertility_system_api.entity.Doctor;
import com.emmkay.infertility_system_api.entity.User;
import com.emmkay.infertility_system_api.entity.WorkSchedule;
import com.emmkay.infertility_system_api.exception.AppException;
import com.emmkay.infertility_system_api.exception.ErrorCode;
import com.emmkay.infertility_system_api.mapper.DoctorMapper;
import com.emmkay.infertility_system_api.mapper.UserMapper;
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
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class DoctorService {

    UserMapper userMapper;
    DoctorMapper doctorMapper;
    DoctorRepository doctorRepository;
    UserRepository userRepository;
    WorkScheduleRepository workScheduleRepository;
    AppointmentService appointmentService;

    public List<DoctorRatingResponse> getAllDoctorRating() {
        return doctorRepository.findAllRatings()
                .stream()
                .map(x -> DoctorRatingResponse.builder()
                        .id(x.getId())
                        .fullName(x.getFullName())
                        .avatarUrl(x.getAvatarUrl())
                        .qualifications(x.getQualifications())
                        .experienceYears(x.getExperienceYears() == null ? 0 : x.getExperienceYears())
                        .specialty(x.getSpecialty())
                        .rate(x.getRate())
                        .build())
                .toList();
    }

    public List<DoctorResponse> getAllDoctors() {
        List<Doctor> doctors = doctorRepository.findAll();
        return doctors.stream().map(doctorMapper::toDoctorResponse).toList();
    }

    public DoctorResponse getDoctorById(String id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.DOCTOR_NOT_EXISTED));
        return doctorMapper.toDoctorResponse(doctor);
    }

    @PreAuthorize("#id == authentication.name")
    public DoctorResponse updateDoctor(String id, DoctorUpdateRequest request) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.DOCTOR_NOT_EXISTED));

        User user = userRepository.findById(doctor.getId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (userRepository.existsByEmailAndIdNot(request.getEmail(), doctor.getId())) {
            throw new AppException(ErrorCode.EMAIL_EXISTED);
        }
        userMapper.updateUser(user, request);
        doctorMapper.updateDoctor(doctor, request);

        userRepository.save(user);
        Doctor updatedDoctor = doctorRepository.save(doctor);
        return doctorMapper.toDoctorResponse(updatedDoctor);
    }

    public List<DoctorResponse> getAvailableDoctors(LocalDate date, String shift) {
        LocalDate today = LocalDate.now();
        if (date.isBefore(today) || date.isAfter(today.plusDays(14))) {
            throw new AppException(ErrorCode.DATE_OUT_OF_RANGE);
        }

        List<String> shiftsToMatch = switch (shift.toUpperCase()) {
            case "MORNING", "AFTERNOON" -> List.of(shift, "FULL_DAY");
            case "FULL_DAY" -> List.of("FULL_DAY");
            default -> throw new AppException(ErrorCode.INVALID_SHIFT_VALUE);
        };

        List<WorkSchedule> schedules = workScheduleRepository.findByWorkDateAndShiftIn(date, shiftsToMatch);
        return schedules.stream()
                .map(WorkSchedule::getDoctor)
                .distinct()
                .filter(doctor -> appointmentService.isDoctorAvailable(doctor.getId(), date, shift))
                .map(doctorMapper::toDoctorResponse)
                .toList();
    }

    public DoctorWorkScheduleResponse getDoctorScheduleNext14Days(String doctorId) {
        LocalDate from = LocalDate.now();
        LocalDate to = from.plusDays(13);

        List<WorkSchedule> schedules = workScheduleRepository
                .findByDoctorIdAndWorkDateBetween(doctorId, from, to);

        Map<String, List<String>> grouped = new LinkedHashMap<>();

        for (WorkSchedule ws : schedules) {
            LocalDate date = ws.getWorkDate();
            String dateKey = date.toString();

            List<String> availableShifts = new ArrayList<>();

            switch (ws.getShift()) {
                case "MORNING":
                case "AFTERNOON":
                    if (appointmentService.isDoctorAvailable(doctorId, date, ws.getShift())) {
                        availableShifts.add(ws.getShift());
                    }
                    break;

                case "FULL_DAY":
                    // Kiểm tra từng ca riêng biệt
                    if (appointmentService.isDoctorAvailable(doctorId, date, "MORNING")) {
                        availableShifts.add("MORNING");
                    }
                    if (appointmentService.isDoctorAvailable(doctorId, date, "AFTERNOON")) {
                        availableShifts.add("AFTERNOON");
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
                .to(to.toString())
                .schedules(grouped)
                .build();
    }

    @PreAuthorize("hasRole('DOCTOR')")
    public DoctorDashboardResponse getDoctorDashBoard(String doctorId) {

        DoctorDashboardProjection x = doctorRepository.getDoctorDashboardStats(doctorId)
                .orElseThrow(() -> new AppException(ErrorCode.DOCTOR_NOT_EXISTED));
        return DoctorDashboardResponse.builder()
                .avgRating(x.getAvgRating())
                .patients(x.getPatients())
                .workShiftsThisMonth(x.getWorkShiftsThisMonth())
                .build();

    }


}
