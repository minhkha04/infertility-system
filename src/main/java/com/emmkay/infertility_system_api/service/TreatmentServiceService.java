package com.emmkay.infertility_system_api.service;

import com.emmkay.infertility_system_api.dto.request.TreatmentServiceCreationRequest;
import com.emmkay.infertility_system_api.dto.request.TreatmentServiceUpdateRequest;
import com.emmkay.infertility_system_api.dto.response.TreatmentServiceResponse;
import com.emmkay.infertility_system_api.entity.TreatmentService;
import com.emmkay.infertility_system_api.entity.TreatmentType;
import com.emmkay.infertility_system_api.entity.User;
import com.emmkay.infertility_system_api.exception.AppException;
import com.emmkay.infertility_system_api.exception.ErrorCode;
import com.emmkay.infertility_system_api.mapper.TreatmentServiceMapper;
import com.emmkay.infertility_system_api.repository.TreatmentServiceRepository;
import com.emmkay.infertility_system_api.repository.TreatmentTypeRepository;
import com.emmkay.infertility_system_api.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TreatmentServiceService {

    TreatmentServiceRepository treatmentServiceRepository;
    TreatmentServiceMapper treatmentServiceMapper;
    UserRepository userRepository;
    TreatmentTypeRepository treatmentTypeRepository;

    @PreAuthorize("hasRole('MANAGER')")
    public TreatmentServiceResponse createTreatmentService(TreatmentServiceCreationRequest request) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userid = authentication.getName();
        if (treatmentServiceRepository.existsByName(request.getName())) {
            throw new AppException(ErrorCode.TREATMENT_SERVICE_IS_EXISTED);
        }

        User user = userRepository.findById(userid).orElseThrow(() ->
                new AppException(ErrorCode.USER_NOT_EXISTED));
        TreatmentType type = treatmentTypeRepository .findById(request.getTreatmentTypeId()).orElseThrow(() ->
                new AppException(ErrorCode.TREATMENT_TYPE_NOT_EXISTED));

        TreatmentService treatmentService = treatmentServiceMapper.toTreatmentService(request);
        treatmentService.setType(type);
        treatmentService.setCreatedBy(user);
        treatmentService.setIsRemove(false);

        return treatmentServiceMapper
                .toTreatmentServiceResponse(treatmentServiceRepository
                        .save(treatmentService));
    }

    @PreAuthorize("hasRole('MANAGER')")
    public List<TreatmentServiceResponse> findAll() {
        return treatmentServiceRepository.findAll()
                .stream()
                .map(treatmentServiceMapper::toTreatmentServiceResponse)
                .toList();
    }

    public TreatmentServiceResponse findById(Integer id) {
        TreatmentService treatmentService = treatmentServiceRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.TREATMENT_SERVICE_NOT_EXISTED));
        return treatmentServiceMapper.toTreatmentServiceResponse(treatmentService);
    }

    @PreAuthorize("hasRole('MANAGER')")
    public TreatmentServiceResponse updateTreatmentService(Integer id, TreatmentServiceUpdateRequest request) {
        TreatmentService treatmentService = treatmentServiceRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.TREATMENT_SERVICE_NOT_EXISTED));

        if (treatmentServiceRepository.existsByNameAndIdNot(request.getName(), id)) {
            throw new AppException(ErrorCode.TREATMENT_SERVICE_IS_EXISTED);
        }

        TreatmentType type = treatmentTypeRepository .findById(request.getTreatmentTypeId()).orElseThrow(() ->
                new AppException(ErrorCode.TREATMENT_TYPE_NOT_EXISTED));
        treatmentService.setType(type);
        treatmentServiceMapper.updateTreatmentService(treatmentService, request);
        return treatmentServiceMapper.toTreatmentServiceResponse(treatmentServiceRepository.save(treatmentService));

    }

    public List<TreatmentServiceResponse> findAllNotRemoved() {
        return treatmentServiceRepository.findAllByIsRemoveFalse()
                .stream()
                .map(treatmentServiceMapper::toTreatmentServiceResponse)
                .toList();
    }

    @PreAuthorize("hasRole('MANAGER')")
    public void removeTreatmentService(Integer id) {
        TreatmentService treatmentService = treatmentServiceRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.TREATMENT_SERVICE_NOT_EXISTED));
        treatmentService.setIsRemove(true);
        treatmentServiceRepository.save(treatmentService);
    }

    @PreAuthorize("hasRole('MANAGER')")
    public TreatmentServiceResponse restoreTreatmentService(Integer id) {
        TreatmentService treatmentService = treatmentServiceRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.TREATMENT_SERVICE_NOT_EXISTED));
        treatmentService.setIsRemove(false);
        return treatmentServiceMapper.toTreatmentServiceResponse(treatmentServiceRepository.save(treatmentService));
    }

}
