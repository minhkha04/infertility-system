package com.emmkay.infertility_system.modules.manager.controller;

import com.emmkay.infertility_system.modules.manager.dto.request.ManagerUpdateRequest;
import com.emmkay.infertility_system.modules.manager.dto.response.*;
import com.emmkay.infertility_system.modules.manager.service.ManagerService;
import com.emmkay.infertility_system.modules.shared.dto.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/v1/managers")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@PreAuthorize("hasRole('MANAGER')")
public class ManagerController {

    ManagerService managerService;

    @PutMapping("/{id}")
    public ApiResponse<ManagerResponse> updateManagerProfile(@PathVariable String id, @RequestBody @Valid ManagerUpdateRequest request) {
        return ApiResponse.<ManagerResponse>builder()
                .result(managerService.updateManagerProfile(id, request))
                .build();
    }

}
