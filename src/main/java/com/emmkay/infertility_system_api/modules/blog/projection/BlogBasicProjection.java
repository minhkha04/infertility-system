package com.emmkay.infertility_system_api.modules.blog.projection;

import java.time.LocalDate;

public interface BlogBasicProjection {
    Long getId();
    String getTitle();
    String getStatus();
    LocalDate getCreatedAt();
    String getCoverImageUrl();
}
