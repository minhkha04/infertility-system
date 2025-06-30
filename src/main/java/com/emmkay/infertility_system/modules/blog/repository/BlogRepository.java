package com.emmkay.infertility_system.modules.blog.repository;

import com.emmkay.infertility_system.modules.blog.entity.Blog;
import com.emmkay.infertility_system.modules.blog.enums.BlogStatus;
import com.emmkay.infertility_system.modules.blog.projection.BlogBasicProjection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BlogRepository extends JpaRepository<Blog, Long> {

    @Query(value = """
                SELECT
                    b.coverImageUrl AS coverImageUrl,
                    b.id AS id,
                    b.status AS status,
                    b.createdAt AS createdAt,
                    b.title AS title
                FROM Blog b
                WHERE
                    (:userId IS NULL OR b.author.id = :userId)
                    AND (:keyword IS NULL OR b.title LIKE %:keyword%)
                    AND (:status IS NULL OR b.status = :status)
            """)
    Page<BlogBasicProjection> searchBlogs(String userId, BlogStatus status, String keyword, Pageable pageable);

    Optional<Blog> findByIdAndStatus(Long id, BlogStatus status);
}
