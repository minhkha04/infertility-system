package com.emmkay.infertility_system.modules.admin.controller;

import com.emmkay.infertility_system.modules.admin.dto.request.AdminUserCreateRequest;
import com.emmkay.infertility_system.modules.admin.dto.request.AdminUserUpdatePasswordRequest;
import com.emmkay.infertility_system.modules.admin.dto.request.AdminUserUpdateRequest;
import com.emmkay.infertility_system.modules.admin.projection.AdminUserBasicProjection;
import com.emmkay.infertility_system.modules.shared.dto.response.ApiResponse;
import com.emmkay.infertility_system.modules.shared.dto.response.PageResponse;
import com.emmkay.infertility_system.modules.user.dto.response.UserResponse;
import com.emmkay.infertility_system.modules.admin.service.AdminUserService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AdminUserController {
    AdminUserService adminService;

    @GetMapping("")
    public ApiResponse<PageResponse<AdminUserBasicProjection>> getUsers(
            @RequestParam boolean isRemoved,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<AdminUserBasicProjection> result = adminService.getUsers(isRemoved, page, size);
        return ApiResponse.<PageResponse<AdminUserBasicProjection>>builder()
                .result(PageResponse.from(result))
                .build();
    }

    @GetMapping("/{userId}")
    public ApiResponse<UserResponse> getUserById(@PathVariable String userId) {
        return ApiResponse.<UserResponse>builder()
                .result(adminService.getUserById(userId))
                .build();
    }

    @PostMapping("")
    public ApiResponse<UserResponse> createUser(@RequestBody @Valid AdminUserCreateRequest request) {
        return ApiResponse.<UserResponse>builder()
                .result(adminService.createUser(request))
                .build();
    }

    @PutMapping("/{userId}")
    public ApiResponse<UserResponse> updateUser(@PathVariable String userId, @RequestBody @Valid AdminUserUpdateRequest request) {
        return ApiResponse.<UserResponse>builder()
                .result(adminService.updateUser(userId, request))
                .build();
    }

    @PutMapping("/{userId}/password")
    public ApiResponse<UserResponse> updateUserPassword(@PathVariable String userId, @RequestBody @Valid AdminUserUpdatePasswordRequest request) {
        return ApiResponse.<UserResponse>builder()
                .result(adminService.updateUserPassword(userId, request))
                .build();
    }

    @PutMapping("/{userId}/restore-user")
    public ApiResponse<UserResponse> restoreUser(@PathVariable String userId) {
        return ApiResponse.<UserResponse>builder()
                .result(adminService.restoreUser(userId))
                .build();
    }

    @DeleteMapping("/{userId}")
    public ApiResponse<UserResponse> removeUser(@PathVariable String userId) {
        return ApiResponse.<UserResponse>builder()
                .result(adminService.removeUser(userId))
                .build();
    }
}
