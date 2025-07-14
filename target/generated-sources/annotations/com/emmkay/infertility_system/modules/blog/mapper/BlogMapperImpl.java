package com.emmkay.infertility_system.modules.blog.mapper;

import com.emmkay.infertility_system.modules.blog.dto.request.BlogCreateRequest;
import com.emmkay.infertility_system.modules.blog.dto.request.BlogUpdateRequest;
import com.emmkay.infertility_system.modules.blog.dto.response.BlogResponse;
import com.emmkay.infertility_system.modules.blog.entity.Blog;
import com.emmkay.infertility_system.modules.user.entity.User;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-07-14T11:23:14+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 24.0.1 (Oracle Corporation)"
)
@Component
public class BlogMapperImpl implements BlogMapper {

    @Override
    public Blog toBlog(BlogCreateRequest request) {
        if ( request == null ) {
            return null;
        }

        Blog blog = new Blog();

        blog.setTitle( request.getTitle() );
        blog.setContent( request.getContent() );
        blog.setSourceReference( request.getSourceReference() );

        return blog;
    }

    @Override
    public void updateBlog(Blog blog, BlogUpdateRequest request) {
        if ( request == null ) {
            return;
        }

        blog.setTitle( request.getTitle() );
        blog.setContent( request.getContent() );
        blog.setSourceReference( request.getSourceReference() );
    }

    @Override
    public BlogResponse toBlogResponse(Blog blog) {
        if ( blog == null ) {
            return null;
        }

        BlogResponse.BlogResponseBuilder blogResponse = BlogResponse.builder();

        blogResponse.authorName( blogAuthorFullName( blog ) );
        blogResponse.approvedByName( blogApprovedByFullName( blog ) );
        blogResponse.id( blog.getId() );
        blogResponse.title( blog.getTitle() );
        blogResponse.content( blog.getContent() );
        blogResponse.status( blog.getStatus() );
        blogResponse.authorType( blog.getAuthorType() );
        blogResponse.sourceReference( blog.getSourceReference() );
        blogResponse.createdAt( blog.getCreatedAt() );
        blogResponse.publishedAt( blog.getPublishedAt() );
        blogResponse.coverImageUrl( blog.getCoverImageUrl() );
        blogResponse.note( blog.getNote() );

        return blogResponse.build();
    }

    private String blogAuthorFullName(Blog blog) {
        if ( blog == null ) {
            return null;
        }
        User author = blog.getAuthor();
        if ( author == null ) {
            return null;
        }
        String fullName = author.getFullName();
        if ( fullName == null ) {
            return null;
        }
        return fullName;
    }

    private String blogApprovedByFullName(Blog blog) {
        if ( blog == null ) {
            return null;
        }
        User approvedBy = blog.getApprovedBy();
        if ( approvedBy == null ) {
            return null;
        }
        String fullName = approvedBy.getFullName();
        if ( fullName == null ) {
            return null;
        }
        return fullName;
    }
}
