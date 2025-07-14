package com.emmkay.infertility_system.modules.feedback.mapper;

import com.emmkay.infertility_system.modules.doctor.entity.Doctor;
import com.emmkay.infertility_system.modules.feedback.dto.request.FeedbackCreateRequest;
import com.emmkay.infertility_system.modules.feedback.dto.request.FeedbackUpdateRequest;
import com.emmkay.infertility_system.modules.feedback.dto.response.FeedbackResponse;
import com.emmkay.infertility_system.modules.feedback.entity.Feedback;
import com.emmkay.infertility_system.modules.treatment.entity.TreatmentRecord;
import com.emmkay.infertility_system.modules.user.entity.User;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-07-14T11:23:13+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 24.0.1 (Oracle Corporation)"
)
@Component
public class FeedbackMapperImpl implements FeedbackMapper {

    @Override
    public Feedback toFeedback(FeedbackCreateRequest request) {
        if ( request == null ) {
            return null;
        }

        Feedback.FeedbackBuilder feedback = Feedback.builder();

        feedback.rating( request.getRating() );
        feedback.comment( request.getComment() );

        return feedback.build();
    }

    @Override
    public FeedbackResponse toResponse(Feedback feedback) {
        if ( feedback == null ) {
            return null;
        }

        FeedbackResponse.FeedbackResponseBuilder feedbackResponse = FeedbackResponse.builder();

        feedbackResponse.customerName( feedbackCustomerFullName( feedback ) );
        feedbackResponse.doctorName( feedbackDoctorUsersFullName( feedback ) );
        feedbackResponse.approvedBy( feedbackApprovedByFullName( feedback ) );
        Long id = feedbackRecordId( feedback );
        if ( id != null ) {
            feedbackResponse.recordId( String.valueOf( id ) );
        }
        feedbackResponse.id( feedback.getId() );
        if ( feedback.getRating() != null ) {
            feedbackResponse.rating( feedback.getRating() );
        }
        feedbackResponse.comment( feedback.getComment() );
        feedbackResponse.status( feedback.getStatus() );
        feedbackResponse.note( feedback.getNote() );

        return feedbackResponse.build();
    }

    @Override
    public void updateFeedback(Feedback feedback, FeedbackUpdateRequest request) {
        if ( request == null ) {
            return;
        }

        feedback.setRating( request.getRating() );
        feedback.setComment( request.getComment() );
    }

    private String feedbackCustomerFullName(Feedback feedback) {
        if ( feedback == null ) {
            return null;
        }
        User customer = feedback.getCustomer();
        if ( customer == null ) {
            return null;
        }
        String fullName = customer.getFullName();
        if ( fullName == null ) {
            return null;
        }
        return fullName;
    }

    private String feedbackDoctorUsersFullName(Feedback feedback) {
        if ( feedback == null ) {
            return null;
        }
        Doctor doctor = feedback.getDoctor();
        if ( doctor == null ) {
            return null;
        }
        User users = doctor.getUsers();
        if ( users == null ) {
            return null;
        }
        String fullName = users.getFullName();
        if ( fullName == null ) {
            return null;
        }
        return fullName;
    }

    private String feedbackApprovedByFullName(Feedback feedback) {
        if ( feedback == null ) {
            return null;
        }
        User approvedBy = feedback.getApprovedBy();
        if ( approvedBy == null ) {
            return null;
        }
        String fullName = approvedBy.getFullName();
        if ( fullName == null ) {
            return null;
        }
        return fullName;
    }

    private Long feedbackRecordId(Feedback feedback) {
        if ( feedback == null ) {
            return null;
        }
        TreatmentRecord record = feedback.getRecord();
        if ( record == null ) {
            return null;
        }
        Long id = record.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }
}
