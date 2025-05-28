package com.emmkay.infertility_system_api.service;

import com.emmkay.infertility_system_api.dto.request.ManagerUpdateRequest;
import com.emmkay.infertility_system_api.dto.response.ManagerResponse;
import com.emmkay.infertility_system_api.entity.User;
import com.emmkay.infertility_system_api.exception.AppException;
import com.emmkay.infertility_system_api.exception.ErrorCode;
import com.emmkay.infertility_system_api.mapper.ManagerMapper;
import com.emmkay.infertility_system_api.repository.UserRepository;
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
