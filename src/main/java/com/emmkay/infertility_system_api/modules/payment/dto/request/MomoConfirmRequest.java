package com.emmkay.infertility_system_api.modules.payment.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MomoConfirmRequest {
    String partnerCode;
    String requestId;
    String orderId;
    String requestType;
    long amount;
    String lang;
    String description;
    String signature;
}
