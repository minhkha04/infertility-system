package com.emmkay.infertility_system_api.exception;

import com.emmkay.infertility_system_api.dto.response.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;


@ControllerAdvice
@Slf4j
public class GlobalExceptionHandler {
    @ExceptionHandler(value = Exception.class)
    ResponseEntity<ApiResponse<Void>> handleException(RuntimeException exception) {
        log.error("Exception: {}", exception.getMessage());
        return ResponseEntity.status(ErrorCode.UNCATEGORIZED_EXCEPTION.getHttpStatus())
                .contentType(MediaType.APPLICATION_JSON)
                .body(ApiResponse.<Void>builder()
                        .code(ErrorCode.UNCATEGORIZED_EXCEPTION.getCode())
                        .message(ErrorCode.UNCATEGORIZED_EXCEPTION.getMessage())
                        .build());
    }

    @ExceptionHandler(value = AppException.class)
    ResponseEntity<ApiResponse<Void>> handleAppException(AppException exception) {
        log.error("AppException: {}", exception.getMessage());
        ErrorCode errorCode = exception.getErrorCode();
        return ResponseEntity.status(errorCode.getHttpStatus()).contentType(MediaType.APPLICATION_JSON)
                .body(ApiResponse.<Void>builder()
                        .code(errorCode.getCode())
                        .message(errorCode.getMessage())
                        .build());
    }

    @ExceptionHandler(value = AccessDeniedException.class)
    ResponseEntity<ApiResponse<Void>> handleAccessDeniedException(AccessDeniedException exception) {
        log.error("AccessDeniedException: {}", exception.getMessage());
        return ResponseEntity.status(ErrorCode.UNAUTHORIZED.getHttpStatus())
                .contentType(MediaType.APPLICATION_JSON)
                .body(ApiResponse.<Void>builder()
                        .code(ErrorCode.UNAUTHORIZED.getCode())
                        .message(ErrorCode.UNAUTHORIZED.getMessage())
                        .build());
    }

    @ExceptionHandler(value = MethodArgumentNotValidException.class)
    ResponseEntity<ApiResponse<Void>> handleValidation(MethodArgumentNotValidException exception) {
        String message = exception.getBindingResult()
                .getAllErrors()
                .stream()
                .findFirst()
                .map(error -> error.getDefaultMessage())
                .orElse("Validation error");
        return ResponseEntity.badRequest()
                .contentType(MediaType.APPLICATION_JSON)
                .body(ApiResponse.<Void>builder()
                        .code(2000)
                        .message(message)
                        .build());
    }

    @ExceptionHandler(value = DataIntegrityViolationException.class)
    ResponseEntity<ApiResponse<Void>> handleSqlException(DataIntegrityViolationException exception) {
        log.error("SQL Exception: {}", exception.getMessage());
        if (exception.getMessage().contains("a foreign key constraint fails")) {
            return ResponseEntity.status(ErrorCode.FOREIGN_KEY_CONFLICT.getHttpStatus())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(ApiResponse.<Void>builder()
                            .code(ErrorCode.FOREIGN_KEY_CONFLICT.getCode())
                            .message(ErrorCode.FOREIGN_KEY_CONFLICT.getMessage())
                            .build());
        }
        return ResponseEntity.status(ErrorCode.UNCATEGORIZED_EXCEPTION.getHttpStatus())
                .contentType(MediaType.APPLICATION_JSON)
                .body(ApiResponse.<Void>builder()
                        .code(ErrorCode.UNCATEGORIZED_EXCEPTION.getCode())
                        .message(ErrorCode.UNCATEGORIZED_EXCEPTION.getMessage())
                        .build());
    }


    @ExceptionHandler(value = HttpMessageNotReadableException.class)
    ResponseEntity<ApiResponse<Void>> handleMissingRequestBody(HttpMessageNotReadableException exception) {
        log.error("HttpMessageNotReadableException: {}", exception.getMessage());
        return ResponseEntity.status(ErrorCode.MISSING_REQUEST_BODY.getHttpStatus())
                .contentType(MediaType.APPLICATION_JSON)
                .body(ApiResponse.<Void>builder()
                        .code(ErrorCode.MISSING_REQUEST_BODY.getCode())
                        .message(ErrorCode.MISSING_REQUEST_BODY.getMessage())
                        .build());

    }


}
