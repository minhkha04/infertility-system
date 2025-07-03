package com.emmkay.infertility_system.modules.payment.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MomoCreateRequest {
    String partnerCode;
    String requestType;
    String ipnUrl;
    String orderId;
    Long amount;
    String orderInfo;
    String requestId;
    String redirectUrl;
    String lang;
    String extraData;
    String signature;
    Boolean autoCapture;
}
