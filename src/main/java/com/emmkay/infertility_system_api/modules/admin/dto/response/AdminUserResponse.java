package com.emmkay.infertility_system_api.modules.admin.dto.response;

import com.emmkay.infertility_system_api.modules.user.dto.response.UserResponse;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
public class AdminUserResponse extends UserResponse {
    boolean isRemoved;
    boolean isVerified;
}
