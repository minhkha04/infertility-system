package com.emmkay.infertility_system_api.modules.treatment.service;

import com.emmkay.infertility_system_api.modules.treatment.dto.request.TreatmentTypeCreateRequest;
import com.emmkay.infertility_system_api.modules.treatment.dto.request.TreatmentTypeUpdateRequest;
import com.emmkay.infertility_system_api.modules.treatment.dto.response.TreatmentTypeResponse;
import com.emmkay.infertility_system_api.modules.treatment.entity.TreatmentStage;
import com.emmkay.infertility_system_api.modules.treatment.entity.TreatmentType;
import com.emmkay.infertility_system_api.modules.shared.exception.AppException;
import com.emmkay.infertility_system_api.modules.shared.exception.ErrorCode;
import com.emmkay.infertility_system_api.modules.treatment.mapper.TreatmentStageMapper;
import com.emmkay.infertility_system_api.modules.treatment.mapper.TreatmentTypeMapper;
import com.emmkay.infertility_system_api.modules.treatment.repository.TreatmentStageRepository;
import com.emmkay.infertility_system_api.modules.treatment.repository.TreatmentTypeRepository;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TreatmentTypeService {

    TreatmentTypeRepository treatmentTypeRepository;
    TreatmentTypeMapper treatmentTypeMapper;
    TreatmentStageMapper treatmentStageMapper;
    TreatmentStageRepository treatmentStageRepository;

    public List<TreatmentTypeResponse> findAll() {
        return treatmentTypeRepository.findAll()
                .stream()
                .map(treatmentTypeMapper::toTreatmentTypeResponse)
                .toList();
    }

    @Transactional
    @PreAuthorize("hasRole('MANAGER')")
    public TreatmentTypeResponse createTreatmentType(@Valid TreatmentTypeCreateRequest request) {
        TreatmentType treatmentType = treatmentTypeMapper.toTreatmentType(request);
        if (treatmentTypeRepository.existsByName(request.getName())) {
            throw new AppException(ErrorCode.TREATMENT_TYPE_IS_EXISTED);
        }
        treatmentType = treatmentTypeRepository.save(treatmentType);

        Set<String> nameSet = new HashSet<>();
        List<TreatmentStage> treatmentStages = new ArrayList<>();
        TreatmentType finalTreatmentType = treatmentType;
        request.getTreatmentStages().forEach(x -> {
            String normalizedName = x.getName().trim().toLowerCase();
            if (!nameSet.add(normalizedName)) {
                throw new AppException(ErrorCode.TREATMENT_STAGE_DUPLICATE);
            }

            TreatmentStage treatmentStage = treatmentStageMapper.toTreatmentStage(x);
            treatmentStage.setType(finalTreatmentType);
            treatmentStages.add(treatmentStage);

        });
        treatmentStageRepository.saveAll(treatmentStages);
        return treatmentTypeMapper.toTreatmentTypeResponse(treatmentType);
    }

    @PreAuthorize("hasRole('MANAGER')")
    public TreatmentTypeResponse updateTreatmentType(Long id, TreatmentTypeUpdateRequest request) {
        TreatmentType treatmentType = treatmentTypeRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.TREATMENT_TYPE_NOT_EXISTED));
        if (treatmentTypeRepository.existsByName(request.getName())) {
            throw new AppException(ErrorCode.TREATMENT_TYPE_IS_EXISTED);
        }
        treatmentTypeMapper.updateTreatmentType(treatmentType, request);
        return treatmentTypeMapper.toTreatmentTypeResponse(treatmentTypeRepository.save(treatmentType));
    }
}
