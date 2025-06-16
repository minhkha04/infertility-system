package com.emmkay.infertility_system_api.dto.request;

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
    long amount;
    String orderInfo;
    String requestId;
    String redirectUrl;
    String lang;
    String extraDate;
    String signature;

}
