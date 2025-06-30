package com.emmkay.infertility_system.modules.shared.enums;

public enum RoleName {
    ADMIN,
    DOCTOR,
    CUSTOMER,
    MANAGER
    ;
    public static RoleName formString(String role) {
        return RoleName.valueOf(role.toUpperCase());
    }
}
