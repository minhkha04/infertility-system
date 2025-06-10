package com.emmkay.infertility_system_api.service;

import com.emmkay.infertility_system_api.dto.request.TreatmentStageBulkCreateRequest;
import com.emmkay.infertility_system_api.dto.request.TreatmentStageCreateRequest;
import com.emmkay.infertility_system_api.dto.request.TreatmentStageUpdateRequest;
import com.emmkay.infertility_system_api.dto.response.TreatmentStageResponse;
import com.emmkay.infertility_system_api.entity.TreatmentStage;
import com.emmkay.infertility_system_api.entity.TreatmentType;
import com.emmkay.infertility_system_api.exception.AppException;
import com.emmkay.infertility_system_api.exception.ErrorCode;
import com.emmkay.infertility_system_api.mapper.TreatmentStageMapper;
import com.emmkay.infertility_system_api.repository.TreatmentStageRepository;
import com.emmkay.infertility_system_api.repository.TreatmentTypeRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

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
    TreatmentTypeRepository treatmentTypeRepository;

    public List<TreatmentStageResponse> findAll() {
        return treatmentStageRepository.findAll()
                .stream()
                .map(treatmentStageMapper::toTreatmentStageResponse)
                .toList();
    }

    public List<TreatmentStageResponse> findByTypeId(Integer typeId) {
        return treatmentStageRepository.findByTypeIdOrderByOrderIndexAsc(typeId)
                .stream()
                .map(treatmentStageMapper::toTreatmentStageResponse)
                .toList();
    }


    @PreAuthorize("hasRole('MANAGER')")
    public List<TreatmentStageResponse> bulkCreateTreatmentStage(TreatmentStageBulkCreateRequest request) {
        TreatmentType type = treatmentTypeRepository.findById(request.getTypeId())
                .orElseThrow(() -> new AppException(ErrorCode.TREATMENT_TYPE_NOT_EXISTED));

        Set<String> nameSet = new HashSet<>();
        List<TreatmentStage> treatmentStages = new ArrayList<>();
        request.getTreatmentStages().forEach(x -> {
            String normalizedName = x.getName().trim().toLowerCase();
            if (!nameSet.add(normalizedName)) {
                throw new AppException(ErrorCode.TREATMENT_STAGE_DUPLICATE);
            }

            TreatmentStage treatmentStage = treatmentStageMapper.toTreatmentStage(x);
            treatmentStage.setType(type);
            treatmentStages.add(treatmentStage);

        });

        return treatmentStageRepository.saveAll(treatmentStages)
                .stream()
                .map(treatmentStageMapper::toTreatmentStageResponse).toList();
    }

    @PreAuthorize("hasRole('MANAGER')")
    public TreatmentStageResponse updateTreatmentStage(Integer id, TreatmentStageUpdateRequest request) {
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

    @PreAuthorize("hasRole('MANAGER')")
    public void deleteTreatmentStage(Integer id) {
        treatmentStageRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.TREATMENT_STAGE_NOT_EXISTED));
        treatmentStageRepository.deleteById(id);
    }
}
