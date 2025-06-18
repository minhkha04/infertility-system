package com.emmkay.infertility_system_api.modules.manager.service;

import com.emmkay.infertility_system_api.modules.manager.dto.request.ManagerUpdateRequest;
import com.emmkay.infertility_system_api.modules.manager.dto.response.ManagerResponse;
import com.emmkay.infertility_system_api.modules.user.entity.User;
import com.emmkay.infertility_system_api.modules.shared.exception.AppException;
import com.emmkay.infertility_system_api.modules.shared.exception.ErrorCode;
import com.emmkay.infertility_system_api.modules.manager.mapper.ManagerMapper;
import com.emmkay.infertility_system_api.modules.appointment.service.AppointmentService;
import com.emmkay.infertility_system_api.modules.user.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ManagerService {
    UserRepository userRepository;
    ManagerMapper managerMapper;
    AppointmentService appointmentService;

    @PreAuthorize("#userId == authentication.name")
    public ManagerResponse updateManagerProfile(String userId, ManagerUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_EXISTED);
        }
        managerMapper.updateManager(user, request);

        return managerMapper.toManagerResponse(userRepository.save(user));
    }
}
