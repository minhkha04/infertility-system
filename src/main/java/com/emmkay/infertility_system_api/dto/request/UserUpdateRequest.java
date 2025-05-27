package com.emmkay.infertility_system_api.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;


@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserUpdateRequest {

    @NotBlank(message = "{validation.required}")
    @Pattern(regexp = "^[a-zA-ZÀ-ỹ\\s]+$", message = "{validation.fullName.pattern}")
    String fullName;

    @NotBlank(message = "{validation.required}")
    @Pattern(regexp = "^(0|\\+84)[1-9][0-9]{8}$", message = "{invalid.phone}")
    String phoneNumber;

    @NotBlank(message = "{validation.required}")
    String gender;

    @NotNull(message = "{validation.required}")
    @JsonFormat(pattern = "yyyy-MM-dd")
    @Past(message = "{invalid.dateOfBirth.past}")
    LocalDate dateOfBirth;

    @NotBlank(message = "{validation.required}")
    String address;
}
