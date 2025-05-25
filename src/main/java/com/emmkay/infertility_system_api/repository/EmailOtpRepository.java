package com.emmkay.infertility_system_api.repository;

import com.emmkay.infertility_system_api.entity.EmailOtp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmailOtpRepository extends JpaRepository<EmailOtp, String> {
}
