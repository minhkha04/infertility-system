package com.emmkay.infertility_system_api.modules.shared.configuration;

import com.emmkay.infertility_system_api.modules.user.entity.Role;
import com.emmkay.infertility_system_api.modules.user.entity.User;
import com.emmkay.infertility_system_api.modules.user.repository.RoleRepository;
import com.emmkay.infertility_system_api.modules.user.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

@Slf4j
@Configuration
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ApplicationInitConfig {

    PasswordEncoder passwordEncoder;
    @Bean
    ApplicationRunner applicationRunner(UserRepository userRepository, RoleRepository roleRepository) {
        return args -> {
           if (!userRepository.existsByUsername("admin")) {
               Role role = roleRepository.findById("ADMIN").orElseThrow();
               User user = User.builder()
                       .username("admin")
                       .password(passwordEncoder.encode("12345678"))
                       .roleName(role)
                       .isRemoved(false)
                       .isVerified(true)
                       .build();
                userRepository.save(user);
                log.warn("Admin user has been created!");
           }
        };
    }
}
