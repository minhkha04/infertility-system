package com.emmkay.infertility_system_api.modules.blog.controller;

import com.emmkay.infertility_system_api.modules.blog.dto.response.BlogResponse;
import com.emmkay.infertility_system_api.modules.blog.projection.BlogBasicProjection;
import com.emmkay.infertility_system_api.modules.blog.service.BlogService;
import com.emmkay.infertility_system_api.modules.shared.dto.response.ApiResponse;
import com.emmkay.infertility_system_api.modules.shared.dto.response.PageResponse;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/public/blogs")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PublicBlogController {

    BlogService blogService;

    @GetMapping("")
    public ApiResponse<PageResponse<BlogBasicProjection>> getApprovedBlogs(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<BlogBasicProjection> result = blogService.searchApprovedBlogs(keyword, page, size);
        return ApiResponse.<PageResponse<BlogBasicProjection>>builder()
                .result(PageResponse.from(result))
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<BlogResponse> getApprovedBlogById(@PathVariable  Long id) {
        return ApiResponse.<BlogResponse>builder()
                .result(blogService.getApprovedBlogById(id))
                .build();
    }

}
