package com.emmkay.infertility_system_api.mapper;

import com.emmkay.infertility_system_api.dto.request.FeedbackCreateRequest;
import com.emmkay.infertility_system_api.dto.request.FeedbackUpdateRequest;
import com.emmkay.infertility_system_api.dto.response.FeedbackResponse;
import com.emmkay.infertility_system_api.entity.Feedback;
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
