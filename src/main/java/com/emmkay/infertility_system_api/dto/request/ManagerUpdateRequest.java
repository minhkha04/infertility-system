package com.emmkay.infertility_system_api.dto.request;


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
