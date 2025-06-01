package com.emmkay.infertility_system_api.service;

import com.emmkay.infertility_system_api.dto.request.AdminUserCreateRequest;
import com.emmkay.infertility_system_api.dto.request.AdminUserUpdatePasswordRequest;
import com.emmkay.infertility_system_api.dto.request.AdminUserUpdateRequest;
import com.emmkay.infertility_system_api.dto.response.AdminUserResponse;
import com.emmkay.infertility_system_api.entity.Doctor;
import com.emmkay.infertility_system_api.entity.Role;
import com.emmkay.infertility_system_api.entity.User;
import com.emmkay.infertility_system_api.exception.AppException;
import com.emmkay.infertility_system_api.exception.ErrorCode;
import com.emmkay.infertility_system_api.mapper.UserMapper;
import com.emmkay.infertility_system_api.repository.DoctorRepository;
import com.emmkay.infertility_system_api.repository.RoleRepository;
import com.emmkay.infertility_system_api.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AdminService {
    UserRepository userRepository;
    UserMapper userMapper;
    RoleRepository roleRepository;
    PasswordEncoder passwordEncoder;
    DoctorRepository doctorRepository;

    public List<AdminUserResponse> getAllUsersIsRemovedFalse() {
        return userRepository.findAllByIsRemovedFalse()
                .stream()
                .map(userMapper::toAdminUserResponse)
                .toList();
    }

    public List<AdminUserResponse> getAllUsersIsRemovedFalseAndRoleName(String roleName) {
        Role role = roleRepository.findById(roleName.toUpperCase())
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_EXISTED)
                );
        return userRepository.findAllByIsRemovedFalseAndRoleName(role)
                .stream()
                .map(userMapper::toAdminUserResponse)
                .toList();
    }

    public List<AdminUserResponse> getAllUsersIsRemovedTrue() {
        return userRepository.findAllByIsRemovedTrue()
                .stream()
                .map(userMapper::toAdminUserResponse)
                .toList();
    }

    public List<AdminUserResponse> getAllUsersIsRemovedTrueAndRoleName(String roleName) {
        Role role = roleRepository.findById(roleName.toUpperCase())
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_EXISTED)
                );
        return userRepository.findAllByIsRemovedTrueAndRoleName(role)
                .stream()
                .map(userMapper::toAdminUserResponse)
                .toList();
    }

    public AdminUserResponse createUser(AdminUserCreateRequest request) {
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
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        user = userRepository.save(user);
        if (user.getRoleName().getName().equals("DOCTOR")) {
            Doctor doctor = Doctor.builder()
                    .users(user)
                    .build();
            doctorRepository.save(doctor);
        }
        return userMapper.toAdminUserResponse(user);
    }

    public void removeUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        if (user.getIsRemoved()) {
            throw new AppException(ErrorCode.USER_NOT_ACTIVE);
        }
        user.setIsRemoved(true);
        userRepository.save(user);
    }

    public void restoreUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        if (!user.getIsRemoved()) {
            throw new AppException(ErrorCode.USER_ALREADY_ACTIVE);
        }
        user.setIsRemoved(false);
        userRepository.save(user);
    }

    public AdminUserResponse updateRole(String userId, String roleName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        Role role = roleRepository.findById(roleName.toUpperCase())
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_EXISTED));
        user.setRoleName(role);
        return userMapper.toAdminUserResponse(userRepository.save(user));
    }

    public AdminUserResponse getUserById(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        return userMapper.toAdminUserResponse(user);
    }

    public AdminUserResponse getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        return userMapper.toAdminUserResponse(user);
    }

    public AdminUserResponse updateUser(String userId, AdminUserUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        if (userRepository.existsByEmailAndIdNot(request.getEmail(), userId)) {
            throw new AppException(ErrorCode.EMAIL_EXISTED);
        }

        userMapper.adminUpdateUser(user, request);
        return userMapper.toAdminUserResponse(userRepository.save(user));
    }

    public void updateUserPassword(String userId, AdminUserUpdatePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);
    }

    public void deleteUserFromDatabase(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        userRepository.delete(user);
    }
}
