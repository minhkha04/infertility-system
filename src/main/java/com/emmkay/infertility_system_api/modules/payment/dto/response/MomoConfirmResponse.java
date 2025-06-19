package com.emmkay.infertility_system_api.modules.payment.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MomoConfirmResponse {
    String partnerCode;
    String orderId;
    String requestId;
    long amount;
    long transId;
    int resultCode;
    String message;
    String requestType;
    long responseTime;
}
