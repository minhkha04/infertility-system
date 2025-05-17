package com.emmkay.infertility_system_api.service;

import com.emmkay.infertility_system_api.dto.request.AuthenticationRequest;
import com.emmkay.infertility_system_api.dto.response.ApiResponse;
import com.emmkay.infertility_system_api.dto.response.AuthenticationResponse;
import com.emmkay.infertility_system_api.entity.User;
import com.emmkay.infertility_system_api.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationService {
    UserRepository userRepository;

    public AuthenticationResponse login(AuthenticationRequest request) {
        String mess = "Login successful";
        User user = userRepository.findByUsername((request.getUsername()))
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!user.getPassword().equals(request.getPassword())) {
            mess = "Wrong password";
        }
        return AuthenticationResponse.builder()
                .token(mess)
                .build();
    }

}
