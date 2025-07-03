package com.emmkay.infertility_system.modules.admin.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AdminUserCreateRequest {
    @NotBlank(message = "{validation.required}")
    @Size(min = 6, max = 20, message = "{validation.username.size}")
    @Pattern(regexp = "^[a-zA-Z0-9]+$", message = "{validation.username.pattern}")
    String username;

    @NotBlank(message = "{validation.required}")
    @Size(min = 8, max = 20, message = "{validation.password.size}")
    String password;

    @NotBlank(message = "{validation.required}")
    String roleName;
}
