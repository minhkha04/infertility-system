package com.emmkay.infertility_system_api.modules.admin.service;

import com.emmkay.infertility_system_api.modules.admin.projection.RoleCountProjection;
import com.emmkay.infertility_system_api.modules.user.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AdminStatisticsService {

    UserRepository userRepository;

    public List<RoleCountProjection> getUserCountByRole() {
        return userRepository.countUserByRoleName();
    }

    public Map<String, Long> getUsersByStatus() {
        long userIsNotRemove= userRepository.countByIsRemoved(false);
        long userIsRemove = userRepository.countByIsRemoved(true);
        return Map.of("userNotRemove", userIsNotRemove, "userRemove", userIsRemove);
    }
}
