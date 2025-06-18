package com.emmkay.infertility_system_api.modules.admin.dto.request;

import com.emmkay.infertility_system_api.modules.user.dto.request.UserUpdateRequest;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@FieldDefaults(level = AccessLevel.PRIVATE)
@EqualsAndHashCode(callSuper = true)
public class AdminUserUpdateRequest extends UserUpdateRequest {

    @NotBlank(message = "{validation.required}")
    @Email(message = "{invalid.email}")
    String email;

}
