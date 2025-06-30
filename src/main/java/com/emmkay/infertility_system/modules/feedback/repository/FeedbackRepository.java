package com.emmkay.infertility_system.modules.feedback.repository;


import com.emmkay.infertility_system.modules.feedback.enums.FeedbackStatus;
import com.emmkay.infertility_system.modules.feedback.projection.FeedBackBasicProjection;
import com.emmkay.infertility_system.modules.feedback.entity.Feedback;
import com.emmkay.infertility_system.modules.feedback.projection.InfoToFeedbackProjection;
import com.emmkay.infertility_system.modules.feedback.projection.PublicFeedbackProjection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {


    boolean existsByCustomerIdAndRecordId(String customerId, Long recordId);

    @Query(value = """
                    SELECT
                        f.id AS id,
                        f.customer.fullName AS customerFullName,
                        f.doctor.users.fullName AS doctorFullName,
                        f.rating AS rating,
                        f.comment AS comment,
                        f.status AS status,
                        f.createdAt AS createAt
                    FROM Feedback f
                    WHERE (:customerId IS NULL OR f.customer.id = :customerId)
                        AND (:doctorId IS NULL OR f.doctor.id = :doctorId)
                        AND (:status IS NULL OR f.status = :status)
                    ORDER BY f.createdAt DESC
            """)
    Page<FeedBackBasicProjection> searchFeedBacks(String customerId, String doctorId, FeedbackStatus status, Pageable pageable);

    @Query(value = """
                    SELECT
                        f.customer.fullName AS customerFullName,
                        f.rating AS rating,
                        f.comment AS comment,
                        f.createdAt AS createdAt,
                        f.customer.avatarUrl AS  customerAvatar
                    FROM Feedback f
                    WHERE f.doctor.id = :doctorId
                        AND f.status = "APPROVED"
                    ORDER BY f.createdAt DESC
            """)
    Page<PublicFeedbackProjection> getFeedbackApproved(String doctorId, Pageable pageable);

    @Query(value = """
                    SELECT
                        tr.doctor.id AS doctorId,
                        tr.customer.id AS customerId,
                        tr.service.id AS serviceId
                    FROM TreatmentRecord tr
                    WHERE tr.id = :recordId
            """)
    InfoToFeedbackProjection getInfoToFeedback(Long recordId);
}
