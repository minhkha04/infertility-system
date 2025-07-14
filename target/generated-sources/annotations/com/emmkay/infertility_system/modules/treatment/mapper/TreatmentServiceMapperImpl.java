package com.emmkay.infertility_system.modules.treatment.mapper;

import com.emmkay.infertility_system.modules.treatment.dto.request.TreatmentServiceCreateRequest;
import com.emmkay.infertility_system.modules.treatment.dto.request.TreatmentServiceUpdateRequest;
import com.emmkay.infertility_system.modules.treatment.dto.request.TreatmentStageCreateRequest;
import com.emmkay.infertility_system.modules.treatment.dto.response.TreatmentServiceResponse;
import com.emmkay.infertility_system.modules.treatment.entity.TreatmentService;
import com.emmkay.infertility_system.modules.treatment.entity.TreatmentStage;
import com.emmkay.infertility_system.modules.user.entity.User;
import java.math.BigDecimal;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-07-14T11:23:13+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 24.0.1 (Oracle Corporation)"
)
@Component
public class TreatmentServiceMapperImpl implements TreatmentServiceMapper {

    @Override
    public TreatmentService toTreatmentService(TreatmentServiceCreateRequest request) {
        if ( request == null ) {
            return null;
        }

        TreatmentService.TreatmentServiceBuilder treatmentService = TreatmentService.builder();

        treatmentService.name( request.getName() );
        treatmentService.description( request.getDescription() );
        treatmentService.price( BigDecimal.valueOf( request.getPrice() ) );
        treatmentService.duration( request.getDuration() );
        treatmentService.treatmentStages( treatmentStageCreateRequestListToTreatmentStageSet( request.getTreatmentStages() ) );

        return treatmentService.build();
    }

    @Override
    public void updateTreatmentService(TreatmentService treatmentService, TreatmentServiceUpdateRequest request) {
        if ( request == null ) {
            return;
        }

        treatmentService.setName( request.getName() );
        treatmentService.setDescription( request.getDescription() );
        treatmentService.setPrice( BigDecimal.valueOf( request.getPrice() ) );
        treatmentService.setDuration( request.getDuration() );
    }

    @Override
    public TreatmentServiceResponse toTreatmentServiceResponse(TreatmentService treatmentService) {
        if ( treatmentService == null ) {
            return null;
        }

        TreatmentServiceResponse.TreatmentServiceResponseBuilder treatmentServiceResponse = TreatmentServiceResponse.builder();

        treatmentServiceResponse.createdBy( treatmentServiceCreatedByFullName( treatmentService ) );
        if ( treatmentService.getId() != null ) {
            treatmentServiceResponse.id( treatmentService.getId().intValue() );
        }
        treatmentServiceResponse.name( treatmentService.getName() );
        treatmentServiceResponse.description( treatmentService.getDescription() );
        if ( treatmentService.getPrice() != null ) {
            treatmentServiceResponse.price( treatmentService.getPrice().doubleValue() );
        }
        treatmentServiceResponse.duration( treatmentService.getDuration() );
        treatmentServiceResponse.coverImageUrl( treatmentService.getCoverImageUrl() );
        if ( treatmentService.getIsRemove() != null ) {
            treatmentServiceResponse.isRemove( treatmentService.getIsRemove() );
        }

        return treatmentServiceResponse.build();
    }

    protected TreatmentStage treatmentStageCreateRequestToTreatmentStage(TreatmentStageCreateRequest treatmentStageCreateRequest) {
        if ( treatmentStageCreateRequest == null ) {
            return null;
        }

        TreatmentStage.TreatmentStageBuilder treatmentStage = TreatmentStage.builder();

        treatmentStage.name( treatmentStageCreateRequest.getName() );
        treatmentStage.description( treatmentStageCreateRequest.getDescription() );
        treatmentStage.expectedDayRange( treatmentStageCreateRequest.getExpectedDayRange() );
        treatmentStage.orderIndex( treatmentStageCreateRequest.getOrderIndex() );

        return treatmentStage.build();
    }

    protected Set<TreatmentStage> treatmentStageCreateRequestListToTreatmentStageSet(List<TreatmentStageCreateRequest> list) {
        if ( list == null ) {
            return null;
        }

        Set<TreatmentStage> set = new LinkedHashSet<TreatmentStage>( Math.max( (int) ( list.size() / .75f ) + 1, 16 ) );
        for ( TreatmentStageCreateRequest treatmentStageCreateRequest : list ) {
            set.add( treatmentStageCreateRequestToTreatmentStage( treatmentStageCreateRequest ) );
        }

        return set;
    }

    private String treatmentServiceCreatedByFullName(TreatmentService treatmentService) {
        if ( treatmentService == null ) {
            return null;
        }
        User createdBy = treatmentService.getCreatedBy();
        if ( createdBy == null ) {
            return null;
        }
        String fullName = createdBy.getFullName();
        if ( fullName == null ) {
            return null;
        }
        return fullName;
    }
}
