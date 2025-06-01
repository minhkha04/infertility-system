package com.emmkay.infertility_system_api.exception;


import lombok.AccessLevel;
import lombok.Getter;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;

@Getter
@FieldDefaults(level = AccessLevel.PRIVATE)
public enum ErrorCode {
    MISSING_REQUEST_BODY(6969, "GỌI API NGU, XEM LẠI SWAGGER", HttpStatus.BAD_REQUEST),
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized exception", HttpStatus.INTERNAL_SERVER_ERROR),
    USERNAME_EXISTED(1001, "Username has been existed", HttpStatus.BAD_REQUEST),
    ROLE_NOT_EXISTED(1002, "Role not found", HttpStatus.NOT_FOUND),
    USER_NOT_EXISTED(1003, "User not found", HttpStatus.NOT_FOUND),
    PASSWORD_ERROR(1004, "Password not correct", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(1005, "You don't have permission", HttpStatus.FORBIDDEN),
    UNAUTHENTICATED(1006, "Unauthenticated", HttpStatus.UNAUTHORIZED),
    USER_NOT_ACTIVE(1007, "Your account has been deactivated. Please contact support at 0346810167", HttpStatus.FORBIDDEN),
    INVALID_GOOGLE_TOKEN(1008, "Invalid google token", HttpStatus.UNAUTHORIZED),
    EMAIL_EXISTED(1009, "Email has been existed", HttpStatus.BAD_REQUEST),
    USER_ALREADY_ACTIVE(1010, "User already active", HttpStatus.BAD_REQUEST),
    OTP_NOT_FOUND(1011, "OTP not existed", HttpStatus.NOT_FOUND),
    OTP_EXPIRED(1012, "OTP expired", HttpStatus.BAD_REQUEST),
    OTP_INVALID(1013, "OTP not matched", HttpStatus.BAD_REQUEST),
    EMAIL_NOT_VERIFIED(1014, "Email not verified", HttpStatus.BAD_REQUEST),
    TREATMENT_TYPE_IS_EXISTED(1015, "Treatment type is existed", HttpStatus.BAD_REQUEST),
    TREATMENT_TYPE_NOT_EXISTED(1016, "Treatment type not found", HttpStatus.NOT_FOUND),
    FOREIGN_KEY_CONFLICT(1017, "Deletion failed: The record is currently referenced by another table", HttpStatus.CONFLICT),
    TREATMENT_STAGE_IS_EXISTED(1018, "Treatment stage is existed", HttpStatus.BAD_REQUEST),
    TREATMENT_STAGE_NOT_EXISTED(1019, "Treatment stage not found", HttpStatus.NOT_FOUND),
    DOCTOR_NOT_EXISTED(1020, "Doctor not found", HttpStatus.NOT_FOUND),
    TREATMENT_SERVICE_IS_EXISTED(1021, "Treatment service is existed", HttpStatus.BAD_REQUEST),
    TREATMENT_SERVICE_NOT_EXISTED(1022, "Treatment service not found", HttpStatus.NOT_FOUND),
    WORK_SCHEDULE_EXISTED(1023, "Work schedule for doctor on date already exists", HttpStatus.BAD_REQUEST),
    UPLOAD_IMAGE_FAILED(1024, "Upload image failed", HttpStatus.INTERNAL_SERVER_ERROR),
    WORK_SCHEDULE_NOT_EXISTED(1025, "Work schedule not found", HttpStatus.NOT_FOUND),
    DATE_OUT_OF_RANGE(1026, "The selected date must be within 14 days from today", HttpStatus.BAD_REQUEST),
    INVALID_SHIFT_VALUE(1027, "Invalid shift value. Must be 'morning', 'afternoon'", HttpStatus.BAD_REQUEST),
    TREATMENT_RECORD_NOT_FOUND(1028, "Treatment record not found", HttpStatus.BAD_REQUEST),
    TREATMENT_STEP_NOT_FOUND(1029, "Treatment step not found", HttpStatus.NOT_FOUND),
    TREATMENT_ALREADY_IN_PROGRESS(1030, "You have an incomplete treatment record. Please complete it before registering for a new service", HttpStatus.BAD_REQUEST),
    CANNOT_CANCEL_TREATMENT(1031, "You cannot cancel this treatment record", HttpStatus.BAD_REQUEST),
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
