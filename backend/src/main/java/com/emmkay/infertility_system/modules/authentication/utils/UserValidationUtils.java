package com.emmkay.infertility_system.modules.authentication.utils;

import com.emmkay.infertility_system.modules.shared.exception.AppException;
import com.emmkay.infertility_system.modules.shared.exception.ErrorCode;
import com.emmkay.infertility_system.modules.user.entity.User;

public class UserValidationUtils {

    private UserValidationUtils() {}

    public static void validateUserIsActiveAndVerified(User user) {
        if (user.getIsRemoved()) {
            throw new AppException(ErrorCode.USER_NOT_ACTIVE);
        }
        if (!user.getIsVerified()) {
            throw new AppException(ErrorCode.EMAIL_NOT_VERIFIED);
        }
    }
}
