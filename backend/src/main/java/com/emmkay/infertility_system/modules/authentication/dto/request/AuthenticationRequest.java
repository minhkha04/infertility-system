package com.emmkay.infertility_system.modules.authentication.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AuthenticationRequest {
    @NotBlank(message = "{validation.required}")
    String username;
    @NotBlank(message = "{validation.required}")
    String password;
}
