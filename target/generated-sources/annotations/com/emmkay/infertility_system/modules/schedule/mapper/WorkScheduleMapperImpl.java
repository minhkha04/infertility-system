package com.emmkay.infertility_system.modules.schedule.mapper;

import com.emmkay.infertility_system.modules.doctor.entity.Doctor;
import com.emmkay.infertility_system.modules.schedule.dto.request.WorkScheduleCreateRequest;
import com.emmkay.infertility_system.modules.schedule.dto.request.WorkScheduleUpdateRequest;
import com.emmkay.infertility_system.modules.schedule.dto.response.WorkScheduleResponse;
import com.emmkay.infertility_system.modules.schedule.entity.WorkSchedule;
import com.emmkay.infertility_system.modules.user.entity.User;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-07-14T11:23:13+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 24.0.1 (Oracle Corporation)"
)
@Component
public class WorkScheduleMapperImpl implements WorkScheduleMapper {

    @Override
    public WorkSchedule toWorkSchedule(WorkScheduleCreateRequest request) {
        if ( request == null ) {
            return null;
        }

        WorkSchedule.WorkScheduleBuilder workSchedule = WorkSchedule.builder();

        workSchedule.shift( request.getShift() );
        workSchedule.workDate( request.getWorkDate() );

        return workSchedule.build();
    }

    @Override
    public WorkScheduleResponse toWorkScheduleResponse(WorkSchedule workSchedule) {
        if ( workSchedule == null ) {
            return null;
        }

        WorkScheduleResponse.WorkScheduleResponseBuilder workScheduleResponse = WorkScheduleResponse.builder();

        workScheduleResponse.createdBy( workScheduleCreatedByFullName( workSchedule ) );
        workScheduleResponse.doctorId( workScheduleDoctorId( workSchedule ) );
        if ( workSchedule.getId() != null ) {
            workScheduleResponse.id( workSchedule.getId().longValue() );
        }
        workScheduleResponse.workDate( workSchedule.getWorkDate() );
        workScheduleResponse.shift( workSchedule.getShift() );
        workScheduleResponse.createdAt( workSchedule.getCreatedAt() );

        return workScheduleResponse.build();
    }

    @Override
    public void updateWorkSchedule(WorkSchedule workSchedule, WorkScheduleUpdateRequest request) {
        if ( request == null ) {
            return;
        }

        workSchedule.setWorkDate( request.getWorkDate() );
        workSchedule.setShift( request.getShift() );
    }

    private String workScheduleCreatedByFullName(WorkSchedule workSchedule) {
        if ( workSchedule == null ) {
            return null;
        }
        User createdBy = workSchedule.getCreatedBy();
        if ( createdBy == null ) {
            return null;
        }
        String fullName = createdBy.getFullName();
        if ( fullName == null ) {
            return null;
        }
        return fullName;
    }

    private String workScheduleDoctorId(WorkSchedule workSchedule) {
        if ( workSchedule == null ) {
            return null;
        }
        Doctor doctor = workSchedule.getDoctor();
        if ( doctor == null ) {
            return null;
        }
        String id = doctor.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }
}
