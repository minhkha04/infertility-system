package com.emmkay.infertility_system_api.exception;


import lombok.AccessLevel;
import lombok.Getter;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;

@Getter
@FieldDefaults(level = AccessLevel.PRIVATE)
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized exception", HttpStatus.INTERNAL_SERVER_ERROR),
    USERNAME_EXISTED(1001, "Username has been existed", HttpStatus.BAD_REQUEST),
    ROLE_NOT_EXISTED(1002, "Role not found", HttpStatus.NOT_FOUND),
    USER_NOT_EXISTED(1003, "User not found", HttpStatus.NOT_FOUND),
    PASSWORD_ERROR(1004, "Password not correct", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(1005, "You don't have permission", HttpStatus.FORBIDDEN),
    UNAUTHENTICATED(1006, "Unauthenticated", HttpStatus.UNAUTHORIZED),
    ;
    int code;
    String message;
    HttpStatus httpStatus;

    ErrorCode(int code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}
