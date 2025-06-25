package com.emmkay.infertility_system_api.modules.treatment.service;

import com.emmkay.infertility_system_api.modules.treatment.dto.request.TreatmentStageUpdateRequest;
import com.emmkay.infertility_system_api.modules.treatment.dto.response.TreatmentStageResponse;
import com.emmkay.infertility_system_api.modules.treatment.entity.TreatmentStage;
import com.emmkay.infertility_system_api.modules.treatment.entity.TreatmentType;
import com.emmkay.infertility_system_api.modules.shared.exception.AppException;
import com.emmkay.infertility_system_api.modules.shared.exception.ErrorCode;
import com.emmkay.infertility_system_api.modules.treatment.mapper.TreatmentStageMapper;
import com.emmkay.infertility_system_api.modules.treatment.repository.TreatmentStageRepository;
import com.emmkay.infertility_system_api.modules.treatment.repository.TreatmentTypeRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TreatmentStageService {

    TreatmentStageRepository treatmentStageRepository;
    TreatmentStageMapper treatmentStageMapper;
    TreatmentTypeRepository treatmentTypeRepository;

    public List<TreatmentStageResponse> findByTypeId(Long typeId) {
        return treatmentStageRepository.findByTypeIdOrderByOrderIndexAsc(typeId)
                .stream()
                .map(treatmentStageMapper::toTreatmentStageResponse)
                .toList();
    }

    public TreatmentStageResponse updateTreatmentStage(Long id, TreatmentStageUpdateRequest request) {
        TreatmentStage treatmentStage = treatmentStageRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.TREATMENT_STAGE_NOT_EXISTED));
        TreatmentType type = treatmentTypeRepository.findById(request.getTypeId())
                .orElseThrow(() -> new AppException(ErrorCode.TREATMENT_TYPE_NOT_EXISTED));
        if (treatmentStageRepository.existsByName(request.getName())) {
            throw new AppException(ErrorCode.TREATMENT_STAGE_IS_EXISTED);
        }
        treatmentStage.setType(type);
        treatmentStageMapper.updateTreatmentStage(treatmentStage, request);
        return treatmentStageMapper.toTreatmentStageResponse(treatmentStageRepository.save(treatmentStage));
    }

    public void deleteTreatmentStage(Long id) {
        treatmentStageRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.TREATMENT_STAGE_NOT_EXISTED));
        treatmentStageRepository.deleteById(id);
    }
}
