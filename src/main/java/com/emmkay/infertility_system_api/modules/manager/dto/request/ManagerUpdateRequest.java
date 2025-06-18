package com.emmkay.infertility_system_api.modules.manager.dto.request;


import com.emmkay.infertility_system_api.modules.user.dto.request.UserUpdateRequest;
import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@FieldDefaults(level = AccessLevel.PRIVATE)
@EqualsAndHashCode(callSuper = false)
public class ManagerUpdateRequest extends UserUpdateRequest {

    @NotBlank(message = "{validation.required}")
    @Email(message = "{invalid.email}")
    String email;
}
