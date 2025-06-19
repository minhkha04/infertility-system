package com.emmkay.infertility_system_api.modules.shared.exception;


import lombok.AccessLevel;
import lombok.Getter;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;

@Getter
@FieldDefaults(level = AccessLevel.PRIVATE)
public enum ErrorCode {
    MISSING_REQUEST_BODY(6969, "GỌI API NGU, XEM LẠI SWAGGER", HttpStatus.BAD_REQUEST),
    UNCATEGORIZED_EXCEPTION(9999, "Lỗi chưa xác định", HttpStatus.INTERNAL_SERVER_ERROR),
    USERNAME_EXISTED(1001, "Tên đăng nhập đã tồn tại", HttpStatus.BAD_REQUEST),
    ROLE_NOT_EXISTED(1002, "Không tìm thấy vai trò", HttpStatus.NOT_FOUND),
    USER_NOT_EXISTED(1003, "Không tìm thấy người dùng", HttpStatus.NOT_FOUND),
    PASSWORD_ERROR(1004, "Mật khẩu không chính xác", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(1005, "Bạn không có quyền truy cập", HttpStatus.FORBIDDEN),
    UNAUTHENTICATED(1006, "Chưa xác thực người dùng", HttpStatus.UNAUTHORIZED),
    USER_NOT_ACTIVE(1007, "Tài khoản của bạn đã bị vô hiệu hoá. Vui lòng liên hệ 0346810167", HttpStatus.FORBIDDEN),
    INVALID_GOOGLE_TOKEN(1008, "Token Google không hợp lệ", HttpStatus.UNAUTHORIZED),
    EMAIL_EXISTED(1009, "Email đã được sử dụng", HttpStatus.BAD_REQUEST),
    USER_ALREADY_ACTIVE(1010, "Tài khoản đã được kích hoạt", HttpStatus.BAD_REQUEST),
    OTP_NOT_FOUND(1011, "Không tìm thấy mã OTP", HttpStatus.NOT_FOUND),
    OTP_EXPIRED(1012, "Mã OTP đã hết hạn", HttpStatus.BAD_REQUEST),
    OTP_INVALID(1013, "Mã OTP không khớp", HttpStatus.BAD_REQUEST),
    EMAIL_NOT_VERIFIED(1014, "Email chưa được xác minh", HttpStatus.BAD_REQUEST),
    TREATMENT_TYPE_IS_EXISTED(1015, "Phương pháp điều trị đã tồn tại", HttpStatus.BAD_REQUEST),
    TREATMENT_TYPE_NOT_EXISTED(1016, "Không tìm thấy phương pháp điều trị", HttpStatus.NOT_FOUND),
    FOREIGN_KEY_CONFLICT(1017, "Xoá thất bại: Dữ liệu đang được liên kết với bảng khác", HttpStatus.CONFLICT),
    TREATMENT_STAGE_IS_EXISTED(1018, "Giai đoạn điều trị đã tồn tại", HttpStatus.BAD_REQUEST),
    TREATMENT_STAGE_NOT_EXISTED(1019, "Không tìm thấy giai đoạn điều trị", HttpStatus.NOT_FOUND),
    DOCTOR_NOT_EXISTED(1020, "Không tìm thấy bác sĩ", HttpStatus.NOT_FOUND),
    TREATMENT_SERVICE_IS_EXISTED(1021, "Dịch vụ điều trị đã tồn tại", HttpStatus.BAD_REQUEST),
    TREATMENT_SERVICE_NOT_EXISTED(1022, "Không tìm thấy dịch vụ điều trị", HttpStatus.NOT_FOUND),
    WORK_SCHEDULE_EXISTED(1023, "Lịch làm việc cho bác sĩ vào ngày này đã tồn tại", HttpStatus.BAD_REQUEST),
    UPLOAD_IMAGE_FAILED(1024, "Tải ảnh lên thất bạ", HttpStatus.INTERNAL_SERVER_ERROR),
    WORK_SCHEDULE_NOT_EXISTED(1025, "Không tìm thấy lịch làm việc", HttpStatus.NOT_FOUND),
    DATE_OUT_OF_RANGE(1026, "Ngày được chọn phải nằm trong phạm vi 14 ngày tới", HttpStatus.BAD_REQUEST),
    INVALID_SHIFT_VALUE(1027, "Giá trị ca làm không hợp lệ. Phải là 'morning', 'afternoon', 'full_day", HttpStatus.BAD_REQUEST),
    TREATMENT_RECORD_NOT_FOUND(1028, "Không tìm thấy hồ sơ điều trị", HttpStatus.BAD_REQUEST),
    TREATMENT_STEP_NOT_FOUND(1029, "Không tìm thấy bước điều trị", HttpStatus.NOT_FOUND),
    TREATMENT_ALREADY_IN_PROGRESS(1030, "Bạn đang có hồ sơ điều trị chưa hoàn tất. Vui lòng hoàn tất trước khi đăng ký dịch vụ mới", HttpStatus.BAD_REQUEST),
    CANNOT_CANCEL_TREATMENT(1031, "Không thể huỷ hồ sơ điều trị này", HttpStatus.BAD_REQUEST),
    APPOINTMENT_NOT_FOUND(1032, "Không tìm thấy lịch hẹn", HttpStatus.NOT_FOUND),
    DOCTOR_NOT_AVAILABLE(1033, "Bác sĩ đã đủ lịch hẹn vào ngày và ca làm được chọn", HttpStatus.BAD_REQUEST),
    APPOINTMENT_IS_COMPLETED(1034, "Không thể đổi lịch hẹn đã hoàn tất", HttpStatus.BAD_REQUEST),
    TREATMENT_STEP_HAS_SCHEDULE(1035, "Bước điều trị này đã được lên lịch", HttpStatus.BAD_REQUEST),
    CAN_NOT_BE_UPDATED_STATUS(1036, "Không thể cập nhật trạng thái", HttpStatus.BAD_REQUEST),
    INVALID_IMAGE_FILE(1037, "File ảnh không hợp lệ. Chỉ chấp nhận JPG, JPEG, PNG", HttpStatus.BAD_REQUEST),
    BLOG_NOT_EXISTED(1038, "Không tìm thấy bài viết", HttpStatus.NOT_FOUND),
    UNAUTHORIZED_ACTION(1039, "Bạn không có quyền thực hiện thao tác này", HttpStatus.FORBIDDEN),
    BLOG_ALREADY_APPROVED(1040, "Bài viết đã được phê duyệt", HttpStatus.BAD_REQUEST),
    BLOG_APPROVED_ERROR(1041, "Chỉ bài viết nháp hoặc bị từ chối mới được gửi duyệt", HttpStatus.BAD_REQUEST),
    INVALID_STATUS(1042, "Trạng thái không hợp lệ", HttpStatus.BAD_REQUEST),
    BLOG_NOT_IN_REVIEW(1043, "Bài viết chưa ở trạng thái chờ duyệt", HttpStatus.BAD_REQUEST),
    INVALID_START_DATE(1044, "Ngày bắt đầu phải cách hiện tại ít nhất 2 ngày", HttpStatus.BAD_REQUEST),
    REMINDER_NOT_FOUND(1045, "Không tìm thấy nhắc lịch", HttpStatus.BAD_REQUEST),
    FEEDBACK_NOT_EXISTED(1046, "Không tìm thấy feedback", HttpStatus.BAD_REQUEST),
    CANNOT_PAY(1047, "Không thể thanh toán hồ sơ điều trị này", HttpStatus.BAD_REQUEST),
    HAS_BEEN_PAID(1048, "Hồ sơ điều trị đã được thanh toán", HttpStatus.BAD_REQUEST),
    VERIFY_PAYMENT_FAIL(1049, "Xác minh thanh toán thất bại", HttpStatus.UNAUTHORIZED),
    PAYMENT_FAIL(1050, "Thanh toán thất bại", HttpStatus.BAD_REQUEST),
    TREATMENT_STAGE_DUPLICATE(1051, "Trùng giai đoạn điều trị", HttpStatus.BAD_REQUEST),
    BLOG_ID_INVALID(1052, "Blog ID sai định dạng", HttpStatus.BAD_REQUEST),
    TREATMENT_RECORD_IS_PAID(1053, "Bạn không thể hủy dịch vụ này vì đã thanh toán, vui lòng gửi mail cho bệnh viện nếu muốn hủy", HttpStatus.BAD_REQUEST),
    TREATMENT_RECORD_IS_COMPLETED_OR_CANCELLED(1054, "Bạn không thể đặt lịch hẹn vì hồ sơ này đã hoàn thành hoặc đã bị hủy", HttpStatus.BAD_REQUEST),
    PAYMENT_METHOD_NOT_SUPPORTED(1055, "Phương thức thanh toán không được hỗ trợ", HttpStatus.BAD_REQUEST),
    GENERATE_QR_FAILED(1056, "Tạo qr thanh toán thất bại", HttpStatus.INTERNAL_SERVER_ERROR),
    CONVERT_TO_BASE64_FAILED(1057, "Convert to base 64 failed", HttpStatus.INTERNAL_SERVER_ERROR),
    APPOINTMENT_NOT_CHANGE(1058, "Bước điều trị đã hoàn thành hoặc bị hủy", HttpStatus.BAD_REQUEST),
    FEEDBACK_IS_EXISTED(1059, "Bạn đã feedback dịch vụ này rồi", HttpStatus.BAD_REQUEST),
    STATUS_IS_INVALID(1060, "Trạng thái truyền vào sai", HttpStatus.BAD_REQUEST),
    PAYMENT_TRANSACTION_NOT_FOUND(1061, "Không tìm thấy hóa đơn", HttpStatus.BAD_REQUEST),
    MOMO_TIMEOUT(1062, "Lỗi thanh toán", HttpStatus.INTERNAL_SERVER_ERROR),
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
