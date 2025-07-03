package com.emmkay.infertility_system.modules.admin.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AdminUserUpdatePasswordRequest {

    @NotBlank(message = "{validation.required}")
    @Size(min = 8, max = 20, message = "{validation.password.size}")
    String password;
}
