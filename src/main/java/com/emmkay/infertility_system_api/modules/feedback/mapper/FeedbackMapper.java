package com.emmkay.infertility_system_api.modules.feedback.mapper;

import com.emmkay.infertility_system_api.modules.feedback.dto.request.FeedbackCreateRequest;
import com.emmkay.infertility_system_api.modules.feedback.dto.request.FeedbackUpdateRequest;
import com.emmkay.infertility_system_api.modules.feedback.dto.response.FeedbackResponse;
import com.emmkay.infertility_system_api.modules.feedback.entity.Feedback;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface FeedbackMapper {


    Feedback toFeedback(FeedbackCreateRequest request);

    @Mapping(target = "customerName", source = "customer.fullName")
    @Mapping(target = "doctorId", source = "doctor.id")
    @Mapping(target = "approvedBy", source = "approvedBy.id")
    @Mapping(target = "recordId", source = "record.id")
    FeedbackResponse toResponse(Feedback feedback);

    void updateFeedback(@MappingTarget Feedback feedback, FeedbackUpdateRequest request);
}
