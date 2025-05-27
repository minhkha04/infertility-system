package com.emmkay.infertility_system_api.dto.request;


import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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

    String avatarUrl;

    @NotBlank(message = "{validation.required}")
    String qualifications;

    @NotBlank(message = "{validation.required}")
    @Min(value = 1950, message = "{invalid.graduationYear.min}")
    @Max(value = 2100, message = "{invalid.graduationYear.max}")
    Integer graduationYear;

    @NotNull(message = "{validation.required}")
    @Min(value = 0, message = "{invalid.experienceYears}")
    Integer experienceYears;
}
