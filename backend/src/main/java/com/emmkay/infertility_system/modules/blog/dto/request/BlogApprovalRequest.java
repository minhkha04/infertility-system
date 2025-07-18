package com.emmkay.infertility_system.modules.blog.dto.request;

import com.emmkay.infertility_system.modules.blog.enums.BlogStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BlogApprovalRequest {

    @NotNull(message = "{validation.required}")
    BlogStatus status;
    String comment;
}
