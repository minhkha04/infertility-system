package com.emmkay.infertility_system_api.modules.blog.controller;

import com.emmkay.infertility_system_api.modules.blog.dto.request.BlogApprovalRequest;
import com.emmkay.infertility_system_api.modules.blog.dto.request.BlogCreateRequest;
import com.emmkay.infertility_system_api.modules.blog.dto.request.BlogUpdateRequest;
import com.emmkay.infertility_system_api.modules.blog.enums.BlogStatus;
import com.emmkay.infertility_system_api.modules.blog.projection.BlogBasicProjection;
import com.emmkay.infertility_system_api.modules.shared.dto.request.UploadImageRequest;
import com.emmkay.infertility_system_api.modules.shared.dto.response.ApiResponse;
import com.emmkay.infertility_system_api.modules.blog.dto.response.BlogResponse;
import com.emmkay.infertility_system_api.modules.blog.service.BlogService;
import com.emmkay.infertility_system_api.modules.shared.dto.response.PageResponse;
import com.emmkay.infertility_system_api.modules.shared.storage.CloudinaryService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/v1/blogs")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BlogController {

    BlogService blogService;
    CloudinaryService cloudinaryService;

    @GetMapping("")
    public ApiResponse<PageResponse<BlogBasicProjection>> searchBlogs(
            @RequestParam(required = false) BlogStatus status,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer size
    ) {
        Page<BlogBasicProjection> result = blogService.searchBlogs(status, keyword, page, size);
        return ApiResponse.<PageResponse<BlogBasicProjection>>builder()
                .result(PageResponse.from(result))
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<BlogResponse> getBlogById(@PathVariable Long id) {
        return ApiResponse.<BlogResponse>builder()
                .result(blogService.getBlogById(id))
                .build();
    }

    @PostMapping("")
    public ApiResponse<BlogResponse> createBlog(@RequestBody @Valid BlogCreateRequest request) {
        return ApiResponse.<BlogResponse>builder()
                .result(blogService.createBlog(request))
                .build();
    }

    @PutMapping("/{blogId}")
    public ApiResponse<BlogResponse> update(@RequestBody @Valid BlogUpdateRequest request, @PathVariable Long blogId) {
        return ApiResponse.<BlogResponse>builder()
                .result(blogService.updateBlog(blogId, request))
                .build();
    }

    @PostMapping("/{blogId}/updateStatus")
    public ApiResponse<BlogResponse> updateStatus(@PathVariable Long blogId, @RequestBody @Valid BlogApprovalRequest request) {
        return ApiResponse.<BlogResponse>builder()
                .result(blogService.updateStatus(blogId, request))
                .build();
    }

    @PostMapping("/{blogId}/submit")
    public ApiResponse<BlogResponse> submitForApproval(@RequestBody @Valid BlogUpdateRequest request, @PathVariable Long blogId) {
        return ApiResponse.<BlogResponse>builder()
                .result(blogService.submitForApproval(request, blogId))
                .build();
    }

    @PutMapping("/{blogId}/image")
    public ApiResponse<BlogResponse> updateImg(@ModelAttribute @Valid UploadImageRequest request, @PathVariable Long blogId) {
        String imageUrl = cloudinaryService.uploadImage(request.getFile(), "blog_img", Long.toString(blogId));
        return ApiResponse.<BlogResponse>builder()
                .result(blogService.updateImg(blogId, imageUrl))
                .build();
    }

    @PostMapping("/{blogId}/hidden")
    public ApiResponse<BlogResponse> hiddenBlog(@PathVariable Long blogId) {
        return ApiResponse.<BlogResponse>builder()
                .result(blogService.hiddenBlog(blogId))
                .build();
    }
}
