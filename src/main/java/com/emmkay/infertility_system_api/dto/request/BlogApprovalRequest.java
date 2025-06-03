package com.emmkay.infertility_system_api.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BlogApprovalRequest {

    @NotBlank(message = "{validation.required}")
    String action;
    String comment;
}
