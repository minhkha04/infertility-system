package com.emmkay.infertility_system_api.modules.payment.configuration;

import lombok.AccessLevel;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@Data
@ConfigurationProperties(prefix = "momo")
@FieldDefaults(level = AccessLevel.PRIVATE)
@RequiredArgsConstructor
public class MomoConfig {
    String partnerCode;
    String returnUrl;
    String endPoint;
    String ipnUrl;
    String accessKey;
    String secretKey;
    String requestType;

}
