package com.emmkay.infertility_system_api.configuration.payment;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@Data
@ConfigurationProperties(prefix = "momo")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MomoConfig {
    String partnerCode;
    String returnUrl;
    String endPoint;
    String ipnUrl;
    String accessKey;
    String secretKey;
    String requestType;
}
