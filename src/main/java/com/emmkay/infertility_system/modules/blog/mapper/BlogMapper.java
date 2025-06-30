package com.emmkay.infertility_system.modules.blog.mapper;

import com.emmkay.infertility_system.modules.blog.dto.request.BlogCreateRequest;
import com.emmkay.infertility_system.modules.blog.dto.request.BlogUpdateRequest;
import com.emmkay.infertility_system.modules.blog.dto.response.BlogResponse;
import com.emmkay.infertility_system.modules.blog.entity.Blog;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface BlogMapper {
    Blog toBlog(BlogCreateRequest request);

    void updateBlog(@MappingTarget Blog blog, BlogUpdateRequest request);

    @Mapping(target = "authorName", source = "author.fullName")
    @Mapping(target = "approvedByName", source = "approvedBy.fullName")
    BlogResponse toBlogResponse(Blog blog);
}
