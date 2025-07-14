package com.emmkay.infertility_system.modules.treatment.mapper;

import com.emmkay.infertility_system.modules.treatment.dto.request.TreatmentStageCreateRequest;
import com.emmkay.infertility_system.modules.treatment.dto.request.TreatmentStageUpdateRequest;
import com.emmkay.infertility_system.modules.treatment.dto.response.TreatmentStageResponse;
import com.emmkay.infertility_system.modules.treatment.entity.TreatmentService;
import com.emmkay.infertility_system.modules.treatment.entity.TreatmentStage;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-07-14T11:23:13+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 24.0.1 (Oracle Corporation)"
)
@Component
public class TreatmentStageMapperImpl implements TreatmentStageMapper {

    @Override
    public TreatmentStage toTreatmentStage(TreatmentStageCreateRequest request) {
        if ( request == null ) {
            return null;
        }

        TreatmentStage.TreatmentStageBuilder treatmentStage = TreatmentStage.builder();

        treatmentStage.name( request.getName() );
        treatmentStage.description( request.getDescription() );
        treatmentStage.expectedDayRange( request.getExpectedDayRange() );
        treatmentStage.orderIndex( request.getOrderIndex() );

        return treatmentStage.build();
    }

    @Override
    public void updateTreatmentStage(TreatmentStage treatmentStage, TreatmentStageUpdateRequest request) {
        if ( request == null ) {
            return;
        }

        treatmentStage.setName( request.getName() );
        treatmentStage.setDescription( request.getDescription() );
        treatmentStage.setExpectedDayRange( request.getExpectedDayRange() );
        treatmentStage.setOrderIndex( request.getOrderIndex() );
    }

    @Override
    public TreatmentStageResponse toTreatmentStageResponse(TreatmentStage treatmentStage) {
        if ( treatmentStage == null ) {
            return null;
        }

        TreatmentStageResponse.TreatmentStageResponseBuilder<?, ?> treatmentStageResponse = TreatmentStageResponse.builder();

        Long id = treatmentStageServiceId( treatmentStage );
        if ( id != null ) {
            treatmentStageResponse.serviceId( id );
        }
        treatmentStageResponse.serviceName( treatmentStageServiceName( treatmentStage ) );
        if ( treatmentStage.getId() != null ) {
            treatmentStageResponse.id( treatmentStage.getId() );
        }
        treatmentStageResponse.name( treatmentStage.getName() );
        treatmentStageResponse.description( treatmentStage.getDescription() );
        treatmentStageResponse.expectedDayRange( treatmentStage.getExpectedDayRange() );
        if ( treatmentStage.getOrderIndex() != null ) {
            treatmentStageResponse.orderIndex( treatmentStage.getOrderIndex() );
        }

        return treatmentStageResponse.build();
    }

    private Long treatmentStageServiceId(TreatmentStage treatmentStage) {
        if ( treatmentStage == null ) {
            return null;
        }
        TreatmentService service = treatmentStage.getService();
        if ( service == null ) {
            return null;
        }
        Long id = service.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String treatmentStageServiceName(TreatmentStage treatmentStage) {
        if ( treatmentStage == null ) {
            return null;
        }
        TreatmentService service = treatmentStage.getService();
        if ( service == null ) {
            return null;
        }
        String name = service.getName();
        if ( name == null ) {
            return null;
        }
        return name;
    }
}
