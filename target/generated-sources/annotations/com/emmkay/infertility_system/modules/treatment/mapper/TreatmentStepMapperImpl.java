package com.emmkay.infertility_system.modules.treatment.mapper;

import com.emmkay.infertility_system.modules.treatment.dto.request.TreatmentStepCreateRequest;
import com.emmkay.infertility_system.modules.treatment.dto.request.TreatmentStepUpdateRequest;
import com.emmkay.infertility_system.modules.treatment.dto.response.TreatmentStepResponse;
import com.emmkay.infertility_system.modules.treatment.entity.TreatmentStage;
import com.emmkay.infertility_system.modules.treatment.entity.TreatmentStep;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-07-14T11:23:13+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 24.0.1 (Oracle Corporation)"
)
@Component
public class TreatmentStepMapperImpl implements TreatmentStepMapper {

    @Override
    public TreatmentStepResponse toTreatmentStepResponse(TreatmentStep treatmentStep) {
        if ( treatmentStep == null ) {
            return null;
        }

        TreatmentStepResponse.TreatmentStepResponseBuilder treatmentStepResponse = TreatmentStepResponse.builder();

        treatmentStepResponse.name( treatmentStepStageName( treatmentStep ) );
        Integer orderIndex = treatmentStepStageOrderIndex( treatmentStep );
        if ( orderIndex != null ) {
            treatmentStepResponse.orderIndex( orderIndex );
        }
        Long id = treatmentStepStageId( treatmentStep );
        if ( id != null ) {
            treatmentStepResponse.treatmentStageId( id );
        }
        if ( treatmentStep.getId() != null ) {
            treatmentStepResponse.id( treatmentStep.getId() );
        }
        treatmentStepResponse.startDate( treatmentStep.getStartDate() );
        treatmentStepResponse.endDate( treatmentStep.getEndDate() );
        treatmentStepResponse.notes( treatmentStep.getNotes() );
        treatmentStepResponse.status( treatmentStep.getStatus() );

        return treatmentStepResponse.build();
    }

    @Override
    public void updateTreatmentStep(TreatmentStep treatmentStep, TreatmentStepUpdateRequest request) {
        if ( request == null ) {
            return;
        }

        treatmentStep.setStartDate( request.getStartDate() );
        treatmentStep.setEndDate( request.getEndDate() );
        treatmentStep.setStatus( request.getStatus() );
        treatmentStep.setNotes( request.getNotes() );
    }

    @Override
    public TreatmentStep toTreatmentStep(TreatmentStepCreateRequest request) {
        if ( request == null ) {
            return null;
        }

        TreatmentStep.TreatmentStepBuilder treatmentStep = TreatmentStep.builder();

        treatmentStep.startDate( request.getStartDate() );
        treatmentStep.status( request.getStatus() );
        treatmentStep.notes( request.getNotes() );

        return treatmentStep.build();
    }

    private String treatmentStepStageName(TreatmentStep treatmentStep) {
        if ( treatmentStep == null ) {
            return null;
        }
        TreatmentStage stage = treatmentStep.getStage();
        if ( stage == null ) {
            return null;
        }
        String name = stage.getName();
        if ( name == null ) {
            return null;
        }
        return name;
    }

    private Integer treatmentStepStageOrderIndex(TreatmentStep treatmentStep) {
        if ( treatmentStep == null ) {
            return null;
        }
        TreatmentStage stage = treatmentStep.getStage();
        if ( stage == null ) {
            return null;
        }
        Integer orderIndex = stage.getOrderIndex();
        if ( orderIndex == null ) {
            return null;
        }
        return orderIndex;
    }

    private Long treatmentStepStageId(TreatmentStep treatmentStep) {
        if ( treatmentStep == null ) {
            return null;
        }
        TreatmentStage stage = treatmentStep.getStage();
        if ( stage == null ) {
            return null;
        }
        Long id = stage.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }
}
