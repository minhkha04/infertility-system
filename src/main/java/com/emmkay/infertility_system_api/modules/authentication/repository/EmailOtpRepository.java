package com.emmkay.infertility_system_api.modules.authentication.repository;

import com.emmkay.infertility_system_api.modules.authentication.entity.EmailOtp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmailOtpRepository extends JpaRepository<EmailOtp, String> {
}
