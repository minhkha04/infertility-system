package com.emmkay.infertility_system_api.configuration;

import com.emmkay.infertility_system_api.entity.Role;
import com.emmkay.infertility_system_api.entity.User;
import com.emmkay.infertility_system_api.repository.RoleRepository;
import com.emmkay.infertility_system_api.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

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
                       .password(passwordEncoder.encode("admin"))
                       .roleName(role)
                       .isRemoved(false)
                       .build();
                userRepository.save(user);
                log.warn("Admin user has been created!");
           }
        };
    }
}
