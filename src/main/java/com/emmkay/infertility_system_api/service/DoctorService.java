package com.emmkay.infertility_system_api.service;

import com.emmkay.infertility_system_api.dto.request.DoctorUpdateRequest;
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
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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

        if (userRepository.existsByEmail(request.getEmail())) {
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

        List<String> shiftsToMatch = switch (shift) {
            case "morning", "afternoon" -> List.of(shift, "full_day");
            case "full_day" -> List.of("full_day");
            default -> throw new AppException(ErrorCode.INVALID_SHIFT_VALUE);
        };

        List<WorkSchedule> schedules = workScheduleRepository.findByWorkDateAndShiftIn(date, shiftsToMatch);
        List<Doctor> doctors = schedules.stream()
                .map(WorkSchedule::getDoctor)
                .distinct()
                .toList();
        return doctors.stream().map(doctorMapper::toDoctorResponse).toList();
    }

    public DoctorWorkScheduleResponse getDoctorScheduleNext14Days(String doctorId) {
        LocalDate from = LocalDate.now();
        LocalDate to = from.plusDays(13); // 14 ngày tính từ hôm nay

        List<WorkSchedule> schedules = workScheduleRepository.findByDoctorIdAndWorkDateBetween(doctorId, from, to);

        Map<String, List<String>> grouped = schedules.stream()
                .collect(Collectors.groupingBy(
                        ws -> ws.getWorkDate().toString(),
                        Collectors.mapping(WorkSchedule::getShift, Collectors.toList())
                ));

        return DoctorWorkScheduleResponse.builder()
                .doctorId(doctorId)
                .from(from.toString())
                .to(to.toString())
                .schedules(grouped)
                .build();
    }

}
