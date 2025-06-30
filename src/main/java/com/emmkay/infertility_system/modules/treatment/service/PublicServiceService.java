package com.emmkay.infertility_system.modules.treatment.service;

import com.emmkay.infertility_system.modules.treatment.dto.response.ServiceDetailResponse;
import com.emmkay.infertility_system.modules.treatment.dto.response.TreatmentStageResponse;
import com.emmkay.infertility_system.modules.treatment.projection.PublicServiceProjection;
import com.emmkay.infertility_system.modules.treatment.projection.TreatmentServiceBasicProjection;
import com.emmkay.infertility_system.modules.treatment.repository.TreatmentServiceRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class PublicServiceService {

    TreatmentServiceRepository treatmentServiceRepository;
    TreatmentStageService treatmentStageService;

    public Page<TreatmentServiceBasicProjection> searchPublicTreatmentService(String name, int page, int size) {
        Pageable pageable = Pageable.ofSize(size).withPage(page);
        return treatmentServiceRepository.searchTreatmentServices(name, false, pageable);
    }

    public ServiceDetailResponse getServiceDetail(Long id) {
        PublicServiceProjection publicServiceProjection = treatmentServiceRepository.getPublicServiceById(id);
        List<TreatmentStageResponse> treatmentStageResponses = treatmentStageService.findByTypeId(publicServiceProjection.getTypeId());
        return ServiceDetailResponse.builder()
                .serviceId(publicServiceProjection.getServiceId())
                .serviceName(publicServiceProjection.getServiceName())
                .typeName(publicServiceProjection.getTypeName())
                .description(publicServiceProjection.getDescription())
                .coverImageUrl(publicServiceProjection.getCoverImageUrl())
                .price(publicServiceProjection.getPrice())
                .duration(publicServiceProjection.getDuration())
                .treatmentStageResponses(treatmentStageResponses)
                .build();
    }
}
