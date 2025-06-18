package com.emmkay.infertility_system_api.modules.payment.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MomoCreateResponse {
    String partnerCode;
    String orderId;
    String requestId;
    long amount;
    long responseTime;
    String message;
    int resultCode;
    String payUrl;
    String deeplink;
    String qrCodeUrl;
}
