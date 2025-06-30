package com.emmkay.infertility_system.modules.doctor.dto.request;


import com.emmkay.infertility_system.modules.user.dto.request.UserUpdateRequest;
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
public class DoctorUpdateRequest extends UserUpdateRequest {

    @NotBlank(message = "{validation.required}")
    String qualifications;

    @NotNull(message = "{validation.required}")
    @Min(value = 1950, message = "{invalid.graduationYear.min}")
    @Max(value = 2100, message = "{invalid.graduationYear.max}")
    Integer graduationYear;

    @NotNull(message = "{validation.required}")
    @Min(value = 0, message = "{invalid.experienceYears}")
    Integer experienceYears;

    @NotBlank(message = "{validation.required}")
    @Email(message = "{invalid.email}")
    String email;

    @NotBlank(message = "{validation.required}")
    String specialty;
}
