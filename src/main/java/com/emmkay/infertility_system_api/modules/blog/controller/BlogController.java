package com.emmkay.infertility_system_api.modules.blog.controller;

import com.emmkay.infertility_system_api.modules.blog.dto.request.BlogApprovalRequest;
import com.emmkay.infertility_system_api.modules.blog.dto.request.BlogCreateRequest;
import com.emmkay.infertility_system_api.modules.blog.dto.request.BlogUpdateRequest;
import com.emmkay.infertility_system_api.modules.blog.projection.BlogBasicProjection;
import com.emmkay.infertility_system_api.modules.shared.dto.request.UploadImageRequest;
import com.emmkay.infertility_system_api.modules.shared.dto.response.ApiResponse;
import com.emmkay.infertility_system_api.modules.blog.dto.response.BlogResponse;
import com.emmkay.infertility_system_api.modules.blog.service.BlogService;
import com.emmkay.infertility_system_api.modules.shared.dto.response.PageResponse;
import com.emmkay.infertility_system_api.modules.shared.security.CurrentUserUtils;
import com.emmkay.infertility_system_api.modules.shared.storage.CloudinaryService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/v1/blogs")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BlogController {

    BlogService blogService;
    CloudinaryService cloudinaryService;

    @GetMapping("")
    public ApiResponse<PageResponse<BlogBasicProjection>> searchBlogs(
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword,
            @RequestParam Integer page,
            @RequestParam Integer size
    ) {
        String currentUserId = CurrentUserUtils.getCurrentUserId();
        log.info("currentUserId: {}", currentUserId);
        Page<BlogBasicProjection> result = blogService.searchBlogs(userId, status, keyword, page, size);
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

    @PostMapping("/{userId}")
    public ApiResponse<BlogResponse> createBlog(@RequestBody @Valid BlogCreateRequest request, @PathVariable String userId) {
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
    public ApiResponse<BlogResponse> approveBlog(@PathVariable Long blogId, @PathVariable String managerId, @RequestBody @Valid BlogApprovalRequest request) {
        return ApiResponse.<BlogResponse>builder()
                .result(blogService.approveBlog(blogId, managerId, request))
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
