package com.emmkay.infertility_system_api.modules.blog.repository;

import com.emmkay.infertility_system_api.modules.blog.entity.Blog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BlogRepository extends JpaRepository<Blog, Long> {

    List<Blog> findAllByAuthorId(String authorId);
}
