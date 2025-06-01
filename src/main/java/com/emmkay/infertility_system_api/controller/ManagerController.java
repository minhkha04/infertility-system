package com.emmkay.infertility_system_api.controller;

import com.emmkay.infertility_system_api.dto.request.ManagerUpdateRequest;
import com.emmkay.infertility_system_api.dto.response.ApiResponse;
import com.emmkay.infertility_system_api.dto.response.ManagerResponse;
import com.emmkay.infertility_system_api.service.ManagerService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/managers")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ManagerController {

    ManagerService managerService;

    @PutMapping()
    public ApiResponse<ManagerResponse> updateManagerProfile(String userId,@RequestBody @Valid ManagerUpdateRequest request) {
        return ApiResponse.<ManagerResponse>builder()
                .result(managerService.updateManagerProfile(userId, request))
                .build();
    }
}
