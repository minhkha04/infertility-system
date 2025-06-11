package com.emmkay.infertility_system_api.controller;

import com.emmkay.infertility_system_api.dto.request.BlogApprovalRequest;
import com.emmkay.infertility_system_api.dto.request.BlogCreateRequest;
import com.emmkay.infertility_system_api.dto.request.BlogUpdateRequest;
import com.emmkay.infertility_system_api.dto.request.UploadImageRequest;
import com.emmkay.infertility_system_api.dto.response.ApiResponse;
import com.emmkay.infertility_system_api.dto.response.BlogResponse;
import com.emmkay.infertility_system_api.dto.response.UserResponse;
import com.emmkay.infertility_system_api.service.BlogService;
import com.emmkay.infertility_system_api.service.CloudinaryService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/blogs")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BlogController {

    BlogService blogService;
    private final CloudinaryService cloudinaryService;

    @GetMapping("")
    public ApiResponse<List<BlogResponse>> getAllBlogs() {
        return ApiResponse.<List<BlogResponse>>builder()
                .result(blogService.getAllBlogs())
                .build();
    }

    @GetMapping("{id}")
    public ApiResponse<BlogResponse> getBlogById(@PathVariable Long id) {
        return ApiResponse.<BlogResponse>builder()
                .result(blogService.getBlogById(id))
                .build();
    }

    @PostMapping("")
    public ApiResponse<BlogResponse> createBlog(@RequestBody @Valid BlogCreateRequest request, String userId) {
        return ApiResponse.<BlogResponse>builder()
                .result(blogService.createBlog(request, userId))
                .build();
    }

    @PutMapping("/{blogId}/{userId}")
    public ApiResponse<BlogResponse> update(@RequestBody @Valid BlogUpdateRequest request, @PathVariable String userId, @PathVariable Long blogId) {
        return ApiResponse.<BlogResponse>builder()
                .result(blogService.updateBlog(blogId, request, userId))
                .build();
    }

    @Operation(summary = "approve blog")
    @PostMapping("/{blogId}/{managerId}")
    public ApiResponse<String> approveBlog(@PathVariable Long blogId, @PathVariable String managerId, BlogApprovalRequest request) {
        blogService.approveBlog(blogId, managerId, request);
        return ApiResponse.<String>builder()
                .result("Blog đã được xét duyệt")
                .build();
    }

    @PostMapping("submit/{blogId}/{userId}")
    public ApiResponse<BlogResponse> submitForApproval(@RequestBody @Valid BlogUpdateRequest request, @PathVariable Long blogId, @PathVariable String userId) {
        return ApiResponse.<BlogResponse>builder()
                .result(blogService.submitForApproval(request, blogId, userId))
                .build();
    }

    @GetMapping("/author/{authorId}")
    public ApiResponse<List<BlogResponse>> getBlogsByAuthor(@PathVariable String authorId) {
        return ApiResponse.<List<BlogResponse>>builder()
                .result(blogService.getBlogByAuthorId(authorId))
                .build();
    }

    @GetMapping("/status/{status}")
    public ApiResponse<List<BlogResponse>> getBlogsByStatus(@PathVariable String status) {
        return ApiResponse.<List<BlogResponse>>builder()
                .result(blogService.getBlogByStatus(status))
                .build();
    }
    @Operation(summary = "upload image, userId is blogId")
    @PutMapping("/update/img")
    public ApiResponse<BlogResponse> updateImg(@ModelAttribute @Valid UploadImageRequest request) {
        String imageUrl = cloudinaryService.uploadImage(request.getFile(), "blog_img", request.getUserId());
        return ApiResponse.<BlogResponse>builder()
                .result(blogService.updateImg(request.getUserId(), imageUrl))
                .build();
    }
}
