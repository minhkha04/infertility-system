package com.emmkay.infertility_system_api.modules.blog.projection;

import com.emmkay.infertility_system_api.modules.blog.enums.BlogStatus;

import java.time.LocalDate;

public interface BlogBasicProjection {
    Long getId();
    String getTitle();
    BlogStatus getStatus();
    LocalDate getCreatedAt();
    String getCoverImageUrl();
}
