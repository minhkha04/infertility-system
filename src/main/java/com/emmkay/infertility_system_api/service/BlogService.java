package com.emmkay.infertility_system_api.service;

import com.emmkay.infertility_system_api.dto.request.BlogApprovalRequest;
import com.emmkay.infertility_system_api.dto.request.BlogCreateRequest;
import com.emmkay.infertility_system_api.dto.request.BlogUpdateRequest;
import com.emmkay.infertility_system_api.dto.response.BlogResponse;
import com.emmkay.infertility_system_api.entity.Blog;
import com.emmkay.infertility_system_api.entity.User;
import com.emmkay.infertility_system_api.exception.AppException;
import com.emmkay.infertility_system_api.exception.ErrorCode;
import com.emmkay.infertility_system_api.mapper.BlogMapper;
import com.emmkay.infertility_system_api.repository.BlogRepository;
import com.emmkay.infertility_system_api.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BlogService {

    BlogRepository blogRepository;
    BlogMapper blogMapper;
    UserRepository userRepository;

    @PreAuthorize("#userId == authentication.name")
    public BlogResponse submitForApproval(BlogUpdateRequest request, Long blogId, String userId) {


        Blog blog = blogRepository.findById(blogId).orElseThrow(()
                -> new AppException(ErrorCode.BLOG_NOT_EXISTED));

        if (!blog.getStatus().equals("DRAFT") && !blog.getStatus().equals("REJECTED")) {
            throw new AppException(ErrorCode.BLOG_APPROVED_ERROR);
        }

        blogMapper.updateBlog(blog, request);
        blog.setStatus("PENDING_REVIEW");
        blog.setNote(null);
        return blogMapper.toBlogResponse(blogRepository.save(blog));

    }

    @PreAuthorize("hasRole('MANAGER')")
    public void approveBlog(Long blogId, String userId, BlogApprovalRequest request) {
        User manager = userRepository.findById(userId)
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
        blogRepository.save(blog);
    }

    public BlogResponse createBlog(BlogCreateRequest request, String userId) {
        User currentUser = userRepository.findById(userId)
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

    public List<BlogResponse> getAllBlogs() {
        return blogRepository.findAll()
                .stream()
                .map(blogMapper::toBlogResponse)
                .toList();
    }

    @PreAuthorize("#userId == authentication.name")
    public BlogResponse updateBlog(Long blogId, BlogUpdateRequest request, String userId) {
        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        Blog blog = blogRepository.findById(blogId)
                .orElseThrow(() -> new AppException(ErrorCode.BLOG_NOT_EXISTED));

        if (!blog.getAuthor().getId().equals(currentUser.getId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED_ACTION);
        }

        blogMapper.updateBlog(blog, request);

        return  blogMapper.toBlogResponse(blogRepository.save(blog));
    }


    public List<BlogResponse> getBlogByAuthorId(String userId) {
        List<Blog> blogs = blogRepository.findAllByAuthorId(userId);
        return blogs.stream().map(blogMapper::toBlogResponse).toList();
    }

    public List<BlogResponse> getBlogByStatus(String status) {
        List<Blog> blogs = blogRepository.findAll().stream()
                .filter(blog -> blog.getStatus().equalsIgnoreCase(status))
                .toList();
        return blogs.stream().map(blogMapper::toBlogResponse).toList();
    }

    public BlogResponse updateImg(String blogId_string, String url) {
        Long blogId;
        try {
            blogId = Long.parseLong(blogId_string);
        } catch (NumberFormatException e) {
            throw new AppException(ErrorCode.BLOG_ID_INVALID);
        }
        Blog blog = blogRepository.findById(blogId)
                .orElseThrow(() -> new AppException(ErrorCode.BLOG_NOT_EXISTED));
        blog.setCoverImageUrl(url);
        blog.setStatus("PENDING_REVIEW");
        return  blogMapper.toBlogResponse(blogRepository.save(blog));
    }
}
