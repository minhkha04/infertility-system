package com.emmkay.infertility_system.modules.admin.projection;

import org.springframework.beans.factory.annotation.Value;

public interface AdminUserBasicProjection {
    String getId();
    String getUsername();
    String getFullName();
    String getEmail();
    @Value("#{target.roleName.name}")
    String getRoleName();
    boolean getIsRemoved();

}
