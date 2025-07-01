package com.emmkay.infertility_system.modules.treatment.service;

import com.emmkay.infertility_system.modules.treatment.dto.request.TreatmentStageCreateRequest;
import com.emmkay.infertility_system.modules.treatment.dto.request.TreatmentStageUpdateRequest;
import com.emmkay.infertility_system.modules.treatment.dto.response.TreatmentStageResponse;
import com.emmkay.infertility_system.modules.treatment.entity.TreatmentService;
import com.emmkay.infertility_system.modules.treatment.entity.TreatmentStage;
import com.emmkay.infertility_system.modules.shared.exception.AppException;
import com.emmkay.infertility_system.modules.shared.exception.ErrorCode;
import com.emmkay.infertility_system.modules.treatment.mapper.TreatmentStageMapper;
import com.emmkay.infertility_system.modules.treatment.repository.TreatmentServiceRepository;
import com.emmkay.infertility_system.modules.treatment.repository.TreatmentStageRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TreatmentStageService {

    TreatmentStageRepository treatmentStageRepository;
    TreatmentStageMapper treatmentStageMapper;
    TreatmentServiceRepository treatmentServiceRepository;

    public List<TreatmentStageResponse> findByServiceId(Long serviceId) {
        return treatmentStageRepository.findByServiceIdOrderByOrderIndexAsc(serviceId)
                .stream()
                .map(treatmentStageMapper::toTreatmentStageResponse)
                .toList();
    }

    public TreatmentStageResponse updateTreatmentStage(Long id, TreatmentStageUpdateRequest request) {
        TreatmentStage treatmentStage = treatmentStageRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.TREATMENT_STAGE_NOT_EXISTED));
        treatmentServiceRepository.findById(request.getServiceId())
                .orElseThrow(() -> new AppException(ErrorCode.TREATMENT_TYPE_NOT_EXISTED));
        if (treatmentStageRepository.existsByName(request.getName())) {
            throw new AppException(ErrorCode.TREATMENT_STAGE_IS_EXISTED);
        }
        treatmentStageMapper.updateTreatmentStage(treatmentStage, request);
        return treatmentStageMapper.toTreatmentStageResponse(treatmentStageRepository.save(treatmentStage));
    }

    @Transactional
    public void saveTreatmentStages(TreatmentService treatmentService, List<TreatmentStageCreateRequest> request) {
        Set<String> nameSet = new HashSet<>();
        List<TreatmentStage> treatmentStages = new ArrayList<>();
        request.forEach(x -> {
            String normalizedName = x.getName().trim().toLowerCase();
            if (!nameSet.add(normalizedName)) {
                throw new AppException(ErrorCode.TREATMENT_STAGE_DUPLICATE);
            }
            TreatmentStage treatmentStage = treatmentStageMapper.toTreatmentStage(x);
            treatmentStage.setService(treatmentService);
            treatmentStages.add(treatmentStage);
        });
        treatmentStageRepository.saveAll(treatmentStages);

    }

//    public void deleteTreatmentStage(Long id) {
//        treatmentStageRepository.findById(id)
//                .orElseThrow(() -> new AppException(ErrorCode.TREATMENT_STAGE_NOT_EXISTED));
//        treatmentStageRepository.deleteById(id);
//    }
}
