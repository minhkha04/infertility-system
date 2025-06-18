package com.emmkay.infertility_system_api.modules.blog.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BlogCreateRequest {
    @NotBlank(message = "{validation.required}")
    String title;
    @NotBlank(message = "{validation.required}")
    String content;

    String sourceReference;
}
