package com.emmkay.infertility_system_api.modules.blog.service;

import com.emmkay.infertility_system_api.modules.blog.dto.request.BlogApprovalRequest;
import com.emmkay.infertility_system_api.modules.blog.dto.request.BlogCreateRequest;
import com.emmkay.infertility_system_api.modules.blog.dto.request.BlogUpdateRequest;
import com.emmkay.infertility_system_api.modules.blog.dto.response.BlogResponse;
import com.emmkay.infertility_system_api.modules.blog.entity.Blog;
import com.emmkay.infertility_system_api.modules.blog.projection.BlogBasicProjection;
import com.emmkay.infertility_system_api.modules.shared.security.CurrentUserUtils;
import com.emmkay.infertility_system_api.modules.user.entity.User;
import com.emmkay.infertility_system_api.modules.shared.exception.AppException;
import com.emmkay.infertility_system_api.modules.shared.exception.ErrorCode;
import com.emmkay.infertility_system_api.modules.blog.mapper.BlogMapper;
import com.emmkay.infertility_system_api.modules.blog.repository.BlogRepository;
import com.emmkay.infertility_system_api.modules.user.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BlogService {

    BlogRepository blogRepository;
    BlogMapper blogMapper;
    UserRepository userRepository;

    private Blog validateAndGetBlog(Long blogId) {
        String currentUserId = CurrentUserUtils.getCurrentUserId();
        String scope = CurrentUserUtils.getCurrentScope();

        Blog blog = blogRepository.findById(blogId)
                .orElseThrow(() -> new AppException(ErrorCode.BLOG_NOT_EXISTED));
        if (scope != null && !scope.isBlank() && scope.equalsIgnoreCase("MANAGER")) {
                return blog;
            }

        if (currentUserId == null || currentUserId.isBlank() || !blog.getAuthor().getId().equals(currentUserId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        return blog;
    }

    public Page<BlogBasicProjection> searchBlogs(String status, String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        String scope = CurrentUserUtils.getCurrentScope();
        String currentUserId = CurrentUserUtils.getCurrentUserId();
        if (scope == null || scope.isBlank() || currentUserId == null || currentUserId.isBlank()) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        return switch (scope.toUpperCase()) {
            case "MANAGER" -> blogRepository.searchBlogs(null, status, keyword, pageable);
            case "DOCTOR", "CUSTOMER" -> blogRepository.searchBlogs(currentUserId, status, keyword, pageable);
            default -> throw new AppException(ErrorCode.UNAUTHORIZED);
        };
    }

    public Page<BlogBasicProjection> searchApprovedBlogs(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return blogRepository.searchBlogs(null, "APPROVED", keyword, pageable);
    }

    public BlogResponse getApprovedBlogById(Long blogId) {
        Blog blog = blogRepository.findByIdAndStatus(blogId, "APPROVED")
                .orElseThrow(() -> new AppException(ErrorCode.BLOG_NOT_EXISTED));
        return blogMapper.toBlogResponse(blog);
    }

    public BlogResponse submitForApproval(BlogUpdateRequest request, Long blogId) {
        Blog blog = validateAndGetBlog(blogId);
        if (!blog.getStatus().equals("DRAFT")
                && !blog.getStatus().equals("REJECTED")
                && !blog.getStatus().equals("HIDDEN")) {
            throw new AppException(ErrorCode.BLOG_APPROVED_ERROR);
        }

        blogMapper.updateBlog(blog, request);
        blog.setStatus("PENDING_REVIEW");
        blog.setNote(null);
        return blogMapper.toBlogResponse(blogRepository.save(blog));

    }

    @PreAuthorize("hasRole('MANAGER')")
    public BlogResponse approveBlog(Long blogId, BlogApprovalRequest request) {
        String currentUserId = CurrentUserUtils.getCurrentUserId();
        if (currentUserId == null || currentUserId.isBlank()) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        User manager = userRepository.findById(currentUserId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        Blog blog = blogRepository.findById(blogId)
                .orElseThrow(() -> new AppException(ErrorCode.BLOG_NOT_EXISTED));

        if (!"PENDING_REVIEW".equals(blog.getStatus())) {
            throw new AppException(ErrorCode.BLOG_NOT_IN_REVIEW);
        }
        switch (request.getAction().toUpperCase()) {
            case "APPROVED":
                blog.setStatus("APPROVED");
                blog.setPublishedAt(LocalDate.now());
                break;
            case "REJECTED":
                blog.setStatus("REJECTED");
                break;
            default:
                throw new AppException(ErrorCode.INVALID_STATUS);
        }
        blog.setNote(request.getComment());
        blog.setApprovedBy(manager);
        return blogMapper.toBlogResponse(blogRepository.save(blog));
    }

    public BlogResponse createBlog(BlogCreateRequest request) {
        String currentUserId = CurrentUserUtils.getCurrentUserId();
        if (currentUserId == null || currentUserId.isBlank()) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        Blog blog = blogMapper.toBlog(request);
        blog.setStatus("DRAFT");
        blog.setAuthorType(currentUser.getRoleName().getName());
        blog.setAuthor(currentUser);
        blog.setCreatedAt(LocalDate.now());
        return blogMapper.toBlogResponse(blogRepository.save(blog));
    }

    public BlogResponse getBlogById(Long blogId) {
        Blog blog = blogRepository.findById(blogId)
                .orElseThrow(() -> new AppException(ErrorCode.BLOG_NOT_EXISTED));
        return blogMapper.toBlogResponse(blog);
    }

    public BlogResponse updateBlog(Long blogId, BlogUpdateRequest request) {
        Blog blog = validateAndGetBlog(blogId);
        blogMapper.updateBlog(blog, request);
        blog.setStatus("DRAFT");
        blog.setApprovedBy(null);
        blog.setNote(null);
        blog.setPublishedAt(null);
        return blogMapper.toBlogResponse(blogRepository.save(blog));
    }

    public BlogResponse updateImg(Long blogId, String url) {
        Blog blog = validateAndGetBlog(blogId);
        blog.setCoverImageUrl(url);
        blog.setStatus("PENDING_REVIEW");
        blog.setApprovedBy(null);
        blog.setNote(null);
        blog.setPublishedAt(null);
        return blogMapper.toBlogResponse(blogRepository.save(blog));
    }

    public BlogResponse hideBlog(Long blogId) {
        Blog blog = validateAndGetBlog(blogId);
        if (!blog.getStatus().equals("APPROVED")) {
            throw new AppException(ErrorCode.CAN_NOT_BE_UPDATED_STATUS);
        }
        blog.setStatus("HIDDEN");
        return blogMapper.toBlogResponse( blogRepository.save(blog));
    }
}
