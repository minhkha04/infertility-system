package com.emmkay.infertility_system.modules.treatment.service;

import com.emmkay.infertility_system.modules.shared.security.CurrentUserUtils;
import com.emmkay.infertility_system.modules.treatment.dto.request.TreatmentServiceCreateRequest;
import com.emmkay.infertility_system.modules.treatment.dto.request.TreatmentServiceUpdateRequest;
import com.emmkay.infertility_system.modules.treatment.dto.response.TreatmentServiceResponse;
import com.emmkay.infertility_system.modules.treatment.entity.TreatmentService;
import com.emmkay.infertility_system.modules.treatment.entity.TreatmentType;
import com.emmkay.infertility_system.modules.treatment.projection.TreatmentServiceBasicProjection;
import com.emmkay.infertility_system.modules.user.entity.User;
import com.emmkay.infertility_system.modules.shared.exception.AppException;
import com.emmkay.infertility_system.modules.shared.exception.ErrorCode;
import com.emmkay.infertility_system.modules.treatment.mapper.TreatmentServiceMapper;
import com.emmkay.infertility_system.modules.treatment.repository.TreatmentServiceRepository;
import com.emmkay.infertility_system.modules.treatment.repository.TreatmentTypeRepository;
import com.emmkay.infertility_system.modules.user.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TreatmentServiceService {

    TreatmentServiceRepository treatmentServiceRepository;
    TreatmentServiceMapper treatmentServiceMapper;
    UserRepository userRepository;
    TreatmentTypeRepository treatmentTypeRepository;

    public Page<TreatmentServiceBasicProjection> searchTreatmentServices(String name, Boolean isRemoved, int page, int size) {
        Pageable pageable = Pageable.ofSize(size).withPage(page);
        return treatmentServiceRepository.searchTreatmentServices(name, isRemoved, pageable);
    }

    public TreatmentServiceResponse createTreatmentService(TreatmentServiceCreateRequest request) {

        String currentUserId = CurrentUserUtils.getCurrentUserId();
        if (currentUserId == null || currentUserId.isBlank()) {
           throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        if (treatmentServiceRepository.existsByName(request.getName())) {
            throw new AppException(ErrorCode.TREATMENT_SERVICE_IS_EXISTED);
        }

        User user = userRepository.findById(currentUserId).orElseThrow(() ->
                new AppException(ErrorCode.USER_NOT_EXISTED));
        TreatmentType type = treatmentTypeRepository.findById(request.getTreatmentTypeId()).orElseThrow(() ->
                new AppException(ErrorCode.TREATMENT_TYPE_NOT_EXISTED));

        TreatmentService treatmentService = treatmentServiceMapper.toTreatmentService(request);
        treatmentService.setType(type);
        treatmentService.setCreatedBy(user);
        treatmentService.setIsRemove(false);

        return treatmentServiceMapper
                .toTreatmentServiceResponse(treatmentServiceRepository
                        .save(treatmentService));
    }

    public TreatmentServiceResponse findById(Long id) {
        TreatmentService treatmentService = treatmentServiceRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.TREATMENT_SERVICE_NOT_EXISTED));
        return treatmentServiceMapper.toTreatmentServiceResponse(treatmentService);
    }

    public TreatmentServiceResponse updateTreatmentService(Long id, TreatmentServiceUpdateRequest request) {
        TreatmentService treatmentService = treatmentServiceRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.TREATMENT_SERVICE_NOT_EXISTED));

        if (treatmentServiceRepository.existsByNameAndIdNot(request.getName(), id)) {
            throw new AppException(ErrorCode.TREATMENT_SERVICE_IS_EXISTED);
        }
        treatmentServiceMapper.updateTreatmentService(treatmentService, request);
        return treatmentServiceMapper.toTreatmentServiceResponse(treatmentServiceRepository.save(treatmentService));

    }

    public TreatmentServiceResponse removeTreatmentService(Long id) {
        TreatmentService treatmentService = treatmentServiceRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.TREATMENT_SERVICE_NOT_EXISTED));
        treatmentService.setIsRemove(true);
        return treatmentServiceMapper.toTreatmentServiceResponse(treatmentServiceRepository.save(treatmentService));
    }

    public TreatmentServiceResponse restoreTreatmentService(Long id) {
        TreatmentService treatmentService = treatmentServiceRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.TREATMENT_SERVICE_NOT_EXISTED));
        treatmentService.setIsRemove(false);
        return treatmentServiceMapper.toTreatmentServiceResponse(treatmentServiceRepository.save(treatmentService));
    }

    public TreatmentServiceResponse uploadImage(Long id, String imageUrl) {
        TreatmentService treatmentService = treatmentServiceRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.TREATMENT_SERVICE_NOT_EXISTED));
        treatmentService.setCoverImageUrl(imageUrl);
        return treatmentServiceMapper.toTreatmentServiceResponse(treatmentServiceRepository.save(treatmentService));
    }
}
