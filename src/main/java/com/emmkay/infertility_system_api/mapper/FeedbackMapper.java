package com.emmkay.infertility_system_api.mapper;

import com.emmkay.infertility_system_api.dto.request.FeedbackCreateRequest;
import com.emmkay.infertility_system_api.dto.response.FeedbackResponse;
import com.emmkay.infertility_system_api.entity.Feedback;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface FeedbackMapper {


    Feedback toFeedback(FeedbackCreateRequest request);

    @Mapping(target = "customerName", source = "customer.fullName")
    @Mapping(target = "doctorId", source = "doctor.id")
    @Mapping(target = "approvedBy", source = "approvedBy.id")
    FeedbackResponse toResponse(Feedback feedback);
}
