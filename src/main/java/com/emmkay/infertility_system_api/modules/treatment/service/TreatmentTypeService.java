package com.emmkay.infertility_system_api.modules.treatment.service;

import com.emmkay.infertility_system_api.modules.treatment.dto.request.TreatmentTypeCreateRequest;
import com.emmkay.infertility_system_api.modules.treatment.dto.request.TreatmentTypeUpdateRequest;
import com.emmkay.infertility_system_api.modules.treatment.dto.response.TreatmentTypeResponse;
import com.emmkay.infertility_system_api.modules.treatment.entity.TreatmentType;
import com.emmkay.infertility_system_api.modules.shared.exception.AppException;
import com.emmkay.infertility_system_api.modules.shared.exception.ErrorCode;
import com.emmkay.infertility_system_api.modules.treatment.mapper.TreatmentTypeMapper;
import com.emmkay.infertility_system_api.modules.treatment.repository.TreatmentTypeRepository;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TreatmentTypeService {

    TreatmentTypeRepository treatmentTypeRepository;
    TreatmentTypeMapper treatmentTypeMapper;

    public List<TreatmentTypeResponse> findAll() {
        return treatmentTypeRepository.findAll()
                        .stream()
                        .map(treatmentTypeMapper::toTreatmentTypeResponse)
                        .toList();
    }

    @PreAuthorize("hasRole('MANAGER')")
    public TreatmentTypeResponse createTreatmentType(@Valid TreatmentTypeCreateRequest request) {
       TreatmentType treatmentType = treatmentTypeMapper.toTreatmentType(request);
       if (treatmentTypeRepository.existsByName(request.getName())) {
           throw new AppException(ErrorCode.TREATMENT_TYPE_IS_EXISTED);
       }
       return  treatmentTypeMapper.toTreatmentTypeResponse(treatmentTypeRepository.save(treatmentType)
       );
    }

    @PreAuthorize("hasRole('MANAGER')")
    public TreatmentTypeResponse updateTreatmentType(Integer id, TreatmentTypeUpdateRequest request) {
        TreatmentType treatmentType = treatmentTypeRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.TREATMENT_TYPE_NOT_EXISTED));
        if (treatmentTypeRepository.existsByName(request.getName())) {
            throw new AppException(ErrorCode.TREATMENT_TYPE_IS_EXISTED);
        }
        treatmentTypeMapper.updateTreatmentType(treatmentType, request);
        return treatmentTypeMapper.toTreatmentTypeResponse(treatmentTypeRepository.save(treatmentType));
    }

    @PreAuthorize("hasRole('MANAGER')")
    public TreatmentTypeResponse deleteTreatmentType(Integer id) {
       TreatmentType treatmentType = treatmentTypeRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.TREATMENT_TYPE_NOT_EXISTED));
        treatmentType.setIsRemove(true);
        return treatmentTypeMapper.toTreatmentTypeResponse(treatmentTypeRepository.save(treatmentType));
    }

    @PreAuthorize("hasRole('MANAGER')")
    public List<TreatmentTypeResponse> findByName(String name) {
        return treatmentTypeRepository.findByNameContainingIgnoreCase(name)
                .stream()
                .map(treatmentTypeMapper::toTreatmentTypeResponse)
                .toList();
    }
}
