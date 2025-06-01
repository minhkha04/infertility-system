package com.emmkay.infertility_system_api.mapper;

import com.emmkay.infertility_system_api.dto.request.WorkScheduleCreateRequest;
import com.emmkay.infertility_system_api.dto.request.WorkScheduleUpdateRequest;
import com.emmkay.infertility_system_api.dto.response.WorkScheduleResponse;
import com.emmkay.infertility_system_api.entity.WorkSchedule;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface WorkScheduleMapper {

    @Mapping(target = "createdBy", ignore = true)
    WorkSchedule toWorkSchedule(WorkScheduleCreateRequest request);

    @Mapping(target = "createdBy", source = "createdBy.fullName")
    @Mapping(target = "doctorId", source = "doctor.id")
    WorkScheduleResponse toWorkScheduleResponse(WorkSchedule workSchedule);

    void updateWorkSchedule(@MappingTarget  WorkSchedule workSchedule, WorkScheduleUpdateRequest request);

}
