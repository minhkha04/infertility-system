package com.emmkay.infertility_system_api.modules.admin.controller;

import com.emmkay.infertility_system_api.modules.admin.dto.request.AdminUserCreateRequest;
import com.emmkay.infertility_system_api.modules.admin.dto.request.AdminUserUpdatePasswordRequest;
import com.emmkay.infertility_system_api.modules.admin.dto.request.AdminUserUpdateRequest;
import com.emmkay.infertility_system_api.modules.admin.dto.response.AdminUserResponse;
import com.emmkay.infertility_system_api.modules.shared.dto.response.ApiResponse;
import com.emmkay.infertility_system_api.modules.user.dto.response.UserResponse;
import com.emmkay.infertility_system_api.modules.admin.service.AdminService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AdminController {
    AdminService adminService;

    @GetMapping("/get-users")
    public ApiResponse<List<AdminUserResponse>> getAllUsers(@RequestParam(required = false) String role) {
        if (role == null) {
            return ApiResponse.<List<AdminUserResponse>>builder()
                    .result(adminService.getAllUsersIsRemovedFalse())
                    .build();
        } else {
            return ApiResponse.<List<AdminUserResponse>>builder()
                    .result(adminService.getAllUsersIsRemovedFalseAndRoleName(role))
                    .build();
        }
    }

    @GetMapping("/get-users-removed")
    public ApiResponse<List<AdminUserResponse>> getAllUsersRemoved(@RequestParam(required = false) String role) {
        if (role == null) {
            return ApiResponse.<List<AdminUserResponse>>builder()
                    .result(adminService.getAllUsersIsRemovedTrue())
                    .build();
        } else {
            return ApiResponse.<List<AdminUserResponse>>builder()
                    .result(adminService.getAllUsersIsRemovedTrueAndRoleName(role))
                    .build();
        }
    }

    @PostMapping("/create-user")
    public ApiResponse<AdminUserResponse> createUser(@RequestBody @Valid AdminUserCreateRequest request) {
        return ApiResponse.<AdminUserResponse>builder()
                .result(adminService.createUser(request))
                .build();
    }

    @DeleteMapping("/remove-user/{userId}")
    public ApiResponse<UserResponse> removeUser(@PathVariable String userId) {
        return ApiResponse.<UserResponse>builder()
                .result(adminService.removeUser(userId))
                .build();
    }

    @PutMapping("/restore-user/{userId}")
    public ApiResponse<UserResponse> restoreUser(@PathVariable String userId) {
        return ApiResponse.<UserResponse>builder()
                .result(adminService.restoreUser(userId))
                .build();
    }

    @GetMapping("/get-user/{userId}")
    public ApiResponse<AdminUserResponse> getUserById(@PathVariable String userId) {
        return ApiResponse.<AdminUserResponse>builder()
                .result(adminService.getUserById(userId))
                .build();
    }

    @GetMapping("/get-user-by-email")
    public ApiResponse<AdminUserResponse> getUserByEmail(@RequestParam String email) {
        return ApiResponse.<AdminUserResponse>builder()
                .result(adminService.getUserByEmail(email))
                .build();
    }

    @PutMapping("/update-user/{userId}")
    public ApiResponse<AdminUserResponse> updateUser(@PathVariable String userId, @RequestBody @Valid AdminUserUpdateRequest request) {
        return ApiResponse.<AdminUserResponse>builder()
                .result(adminService.updateUser(userId, request))
                .build();
    }

    @PutMapping("/update-user-password/{userId}")
    public ApiResponse<UserResponse> updateUserPassword(@PathVariable String userId, @RequestBody @Valid AdminUserUpdatePasswordRequest request) {
        return ApiResponse.<UserResponse>builder()
                .result(adminService.updateUserPassword(userId, request))
                .build();
    }
}
