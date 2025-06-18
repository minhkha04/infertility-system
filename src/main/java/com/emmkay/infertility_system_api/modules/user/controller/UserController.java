package com.emmkay.infertility_system_api.modules.user.controller;

import com.emmkay.infertility_system_api.modules.shared.dto.request.UploadImageRequest;
import com.emmkay.infertility_system_api.modules.user.dto.request.UserUpdateRequest;
import com.emmkay.infertility_system_api.modules.shared.dto.response.ApiResponse;
import com.emmkay.infertility_system_api.modules.user.dto.response.UserResponse;
import com.emmkay.infertility_system_api.modules.shared.storage.CloudinaryService;
import com.emmkay.infertility_system_api.modules.user.service.UserService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserController {

    UserService userService;
    CloudinaryService cloudinaryService;


    @GetMapping("/myInfo")
    public ApiResponse<UserResponse> getMyInfo() {
        return userService.getMyInfo();
    }

    @PutMapping("/update/{userId}")
    public ApiResponse<UserResponse> updateUser(@PathVariable  String userId, @RequestBody @Valid UserUpdateRequest request) {
        return ApiResponse.<UserResponse>builder()
                .result(userService.updateUser(userId, request))
                .build();
    }

    @PutMapping("/upload-avatar")
    public ApiResponse<UserResponse> uploadAvatar(@ModelAttribute @Valid UploadImageRequest request) {
        String imageUrl = cloudinaryService.uploadImage(request.getFile(), "avt", request.getUserId());
        return ApiResponse.<UserResponse>builder()
                .result(userService.uploadAvatar(request.getUserId(), imageUrl))
                .build();
    }

}
