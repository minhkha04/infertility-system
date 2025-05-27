package com.emmkay.infertility_system_api.controller;

import com.emmkay.infertility_system_api.dto.request.AdminUserCreationRequest;
import com.emmkay.infertility_system_api.dto.request.AdminUserUpdatePasswordRequest;
import com.emmkay.infertility_system_api.dto.request.AdminUserUpdateRequest;
import com.emmkay.infertility_system_api.dto.response.AdminUserResponse;
import com.emmkay.infertility_system_api.dto.response.ApiResponse;
import com.emmkay.infertility_system_api.service.AdminService;
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
    public ApiResponse<AdminUserResponse> createUser(@RequestBody @Valid AdminUserCreationRequest request) {
        return ApiResponse.<AdminUserResponse>builder()
                .result(adminService.createUser(request))
                .build();
    }

    @DeleteMapping("/remove-user/{userId}")
    public ApiResponse<String> removeUser(@PathVariable String userId) {
        adminService.removeUser(userId);
        return ApiResponse.<String>builder()
                .result("User has been removed successfully!")
                .build();
    }

    @PutMapping("/restore-user/{userId}")
    public ApiResponse<String> restoreUser(@PathVariable String userId) {
        adminService.restoreUser(userId);
        return ApiResponse.<String>builder()
                .result("User has been restored successfully!")
                .build();
    }

    @PutMapping("/update-role/{userId}")
    public ApiResponse<AdminUserResponse> updateRole(@PathVariable String userId, @RequestParam String roleName) {
        return ApiResponse.<AdminUserResponse>builder()
                .result(adminService.updateRole(userId, roleName))
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
    public ApiResponse<String> updateUserPassword(@PathVariable String userId, @RequestBody @Valid AdminUserUpdatePasswordRequest request) {
        adminService.updateUserPassword(userId, request);

        return ApiResponse.<String>builder()
                .result("User password has been updated successfully!")
                .build();
    }

}
