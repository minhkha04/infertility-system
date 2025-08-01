package com.emmkay.infertility_system.modules.admin.service;

import com.emmkay.infertility_system.modules.admin.dto.request.AdminUserCreateRequest;
import com.emmkay.infertility_system.modules.admin.dto.request.AdminUserUpdatePasswordRequest;
import com.emmkay.infertility_system.modules.admin.dto.request.AdminUserUpdateRequest;
import com.emmkay.infertility_system.modules.admin.projection.AdminUserBasicProjection;
import com.emmkay.infertility_system.modules.shared.enums.RoleName;
import com.emmkay.infertility_system.modules.treatment.entity.TreatmentRecord;
import com.emmkay.infertility_system.modules.treatment.enums.TreatmentRecordStatus;
import com.emmkay.infertility_system.modules.treatment.repository.TreatmentRecordRepository;
import com.emmkay.infertility_system.modules.user.dto.response.UserResponse;
import com.emmkay.infertility_system.modules.doctor.entity.Doctor;
import com.emmkay.infertility_system.modules.user.entity.Role;
import com.emmkay.infertility_system.modules.user.entity.User;
import com.emmkay.infertility_system.modules.shared.exception.AppException;
import com.emmkay.infertility_system.modules.shared.exception.ErrorCode;
import com.emmkay.infertility_system.modules.user.mapper.UserMapper;
import com.emmkay.infertility_system.modules.doctor.repository.DoctorRepository;
import com.emmkay.infertility_system.modules.user.repository.RoleRepository;
import com.emmkay.infertility_system.modules.user.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AdminUserService {

    UserRepository userRepository;
    UserMapper userMapper;
    RoleRepository roleRepository;
    PasswordEncoder passwordEncoder;
    DoctorRepository doctorRepository;
    TreatmentRecordRepository treatmentRecordRepository;

    public Page<AdminUserBasicProjection> getUsers(boolean isRemoved, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return userRepository.findByIsRemoved(isRemoved, pageable);
    }

    public UserResponse createUser(AdminUserCreateRequest request) {
        Optional<User> userOptional = userRepository.findByUsername(request.getUsername());
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            if (user.getIsRemoved()) {
                throw new AppException(ErrorCode.USER_NOT_ACTIVE);
            }
            throw new AppException(ErrorCode.USERNAME_EXISTED);
        }
        User user = userMapper.toUser(request);
        Role role = roleRepository.findById(request.getRoleName().toUpperCase())
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_EXISTED));
        user.setRoleName(role);
        user.setIsRemoved(false);
        user.setIsVerified(true);
        user.setAvatarUrl("https://res.cloudinary.com/di6hi1r0g/image/upload/v1749288955/default-avatar_qwb4ru.png");
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        user = userRepository.save(user);
        if (user.getRoleName().getName().equals(RoleName.DOCTOR.name())) {
            Doctor doctor = Doctor.builder()
                    .users(user)
                    .isPublic(false)
                    .build();
            doctorRepository.save(doctor);
        }
        return userMapper.toUserResponse(user);
    }

    public UserResponse removeUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        if (user.getIsRemoved()) {
            throw new AppException(ErrorCode.USER_NOT_ACTIVE);
        }
        if (RoleName.valueOf(user.getRoleName().getName()) == RoleName.DOCTOR) {
            List<TreatmentRecord> treatmentRecords = treatmentRecordRepository.findByDoctorIdAndStatusIn(userId, List.of(TreatmentRecordStatus.INPROGRESS, TreatmentRecordStatus.CONFIRMED));
            if (!treatmentRecords.isEmpty()) {
                throw new AppException(ErrorCode.DOCTOR_HAS_TREATMENT_RECORD);
            }
        }
        if (RoleName.valueOf(user.getRoleName().getName()) == RoleName.ADMIN) {
            throw new AppException(ErrorCode.ADMIN_CANNOT_BE_REMOVED);
        }
        user.setIsRemoved(true);
        return userMapper.toUserResponse(userRepository.save(user));
    }

    public UserResponse restoreUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        if (!user.getIsRemoved()) {
            throw new AppException(ErrorCode.USER_ALREADY_ACTIVE);
        }
        user.setIsRemoved(false);
        return userMapper.toUserResponse(userRepository.save(user));
    }

    public UserResponse getUserById(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        return userMapper.toUserResponse(user);
    }

    public UserResponse updateUser(String userId, AdminUserUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        if (userRepository.existsByEmailAndIdNot(request.getEmail(), userId)) {
            throw new AppException(ErrorCode.EMAIL_EXISTED);
        }

        userMapper.adminUpdateUser(user, request);
        return userMapper.toUserResponse(userRepository.save(user));
    }

    public UserResponse updateUserPassword(String userId, AdminUserUpdatePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        return userMapper.toUserResponse(userRepository.save(user));
    }
}
