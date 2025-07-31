package com.emmkay.infertility_system.modules.feedback.mapper;

import com.emmkay.infertility_system.modules.feedback.dto.request.FeedbackCreateRequest;
import com.emmkay.infertility_system.modules.feedback.dto.request.FeedbackUpdateRequest;
import com.emmkay.infertility_system.modules.feedback.dto.response.FeedbackResponse;
import com.emmkay.infertility_system.modules.feedback.entity.Feedback;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface FeedbackMapper {

    Feedback toFeedback(FeedbackCreateRequest request);

    @Mapping(target = "customerName", source = "customer.fullName")
    @Mapping(target = "doctorName", source = "doctor.users.fullName")
    @Mapping(target = "approvedBy", source = "approvedBy.fullName")
    @Mapping(target = "recordId", source = "record.id")
    FeedbackResponse toResponse(Feedback feedback);

    void updateFeedback(@MappingTarget Feedback feedback, FeedbackUpdateRequest request);
}
