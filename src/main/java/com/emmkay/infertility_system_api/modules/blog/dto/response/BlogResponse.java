package com.emmkay.infertility_system_api.modules.blog.dto.response;

import com.emmkay.infertility_system_api.modules.blog.enums.BlogStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BlogResponse {
    Long id;
    String title;
    String content;
    BlogStatus status;
    String authorType;
    String authorName;
    String approvedByName;
    String sourceReference;
    LocalDate createdAt;
    LocalDate publishedAt;
    String coverImageUrl;
    String note;
}
