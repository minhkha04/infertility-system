package com.emmkay.infertility_system.modules.treatment.mapper;

import com.emmkay.infertility_system.modules.doctor.entity.Doctor;
import com.emmkay.infertility_system.modules.treatment.dto.response.TreatmentRecordResponse;
import com.emmkay.infertility_system.modules.treatment.entity.TreatmentRecord;
import com.emmkay.infertility_system.modules.treatment.entity.TreatmentService;
import com.emmkay.infertility_system.modules.user.entity.User;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-07-15T00:13:57+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 24.0.1 (Oracle Corporation)"
)
@Component
public class TreatmentRecordMapperImpl implements TreatmentRecordMapper {

    @Override
    public TreatmentRecordResponse toTreatmentRecordResponse(TreatmentRecord request) {
        if ( request == null ) {
            return null;
        }

        TreatmentRecordResponse.TreatmentRecordResponseBuilder treatmentRecordResponse = TreatmentRecordResponse.builder();

        treatmentRecordResponse.customerName( requestCustomerFullName( request ) );
        treatmentRecordResponse.doctorName( requestDoctorUsersFullName( request ) );
        treatmentRecordResponse.treatmentServiceName( requestServiceName( request ) );
        treatmentRecordResponse.customerId( requestCustomerId( request ) );
        Long id1 = requestServiceId( request );
        if ( id1 != null ) {
            treatmentRecordResponse.treatmentServiceId( id1 );
        }
        if ( request.getId() != null ) {
            treatmentRecordResponse.id( request.getId() );
        }
        treatmentRecordResponse.startDate( request.getStartDate() );
        treatmentRecordResponse.endDate( request.getEndDate() );
        treatmentRecordResponse.status( request.getStatus() );
        treatmentRecordResponse.createdDate( request.getCreatedDate() );

        return treatmentRecordResponse.build();
    }

    private String requestCustomerFullName(TreatmentRecord treatmentRecord) {
        if ( treatmentRecord == null ) {
            return null;
        }
        User customer = treatmentRecord.getCustomer();
        if ( customer == null ) {
            return null;
        }
        String fullName = customer.getFullName();
        if ( fullName == null ) {
            return null;
        }
        return fullName;
    }

    private String requestDoctorUsersFullName(TreatmentRecord treatmentRecord) {
        if ( treatmentRecord == null ) {
            return null;
        }
        Doctor doctor = treatmentRecord.getDoctor();
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

    private String requestServiceName(TreatmentRecord treatmentRecord) {
        if ( treatmentRecord == null ) {
            return null;
        }
        TreatmentService service = treatmentRecord.getService();
        if ( service == null ) {
            return null;
        }
        String name = service.getName();
        if ( name == null ) {
            return null;
        }
        return name;
    }

    private String requestCustomerId(TreatmentRecord treatmentRecord) {
        if ( treatmentRecord == null ) {
            return null;
        }
        User customer = treatmentRecord.getCustomer();
        if ( customer == null ) {
            return null;
        }
        String id = customer.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private Long requestServiceId(TreatmentRecord treatmentRecord) {
        if ( treatmentRecord == null ) {
            return null;
        }
        TreatmentService service = treatmentRecord.getService();
        if ( service == null ) {
            return null;
        }
        Long id = service.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }
}
