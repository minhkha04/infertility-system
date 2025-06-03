package com.emmkay.infertility_system_api.repository;

import com.emmkay.infertility_system_api.entity.Blog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BlogRepository extends JpaRepository<Blog, Long> {

    List<Blog> findAllByAuthorId(String authorId);
}
