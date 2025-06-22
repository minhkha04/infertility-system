package com.emmkay.infertility_system_api.modules.feedback.repository;


import com.emmkay.infertility_system_api.modules.feedback.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {

    List<Feedback> findByCustomerId(String customerId);

    List<Feedback> findByDoctorIdAndIsApproved(String doctorId, Boolean isApproved);

    boolean existsByCustomerIdAndRecordId(String customerId, Long recordId);
}
