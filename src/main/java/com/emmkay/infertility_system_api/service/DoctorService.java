package com.emmkay.infertility_system_api.service;

import com.emmkay.infertility_system_api.dto.request.DoctorUpdateRequest;
import com.emmkay.infertility_system_api.dto.response.DoctorResponse;
import com.emmkay.infertility_system_api.entity.Doctor;
import com.emmkay.infertility_system_api.entity.User;
import com.emmkay.infertility_system_api.exception.AppException;
import com.emmkay.infertility_system_api.exception.ErrorCode;
import com.emmkay.infertility_system_api.mapper.DoctorMapper;
import com.emmkay.infertility_system_api.mapper.UserMapper;
import com.emmkay.infertility_system_api.repository.DoctorRepository;
import com.emmkay.infertility_system_api.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class DoctorService {

    UserMapper userMapper;
    DoctorMapper doctorMapper;
    DoctorRepository doctorRepository;
    UserRepository userRepository;

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

    @PreAuthorize("#doctorId == authentication.name")
    public DoctorResponse uploadAvatar(String doctorId, String imageUrl) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new AppException(ErrorCode.DOCTOR_NOT_EXISTED));

        doctor.setAvatarUrl(imageUrl);
        Doctor updatedDoctor = doctorRepository.save(doctor);
        return doctorMapper.toDoctorResponse(updatedDoctor);
    }
}
