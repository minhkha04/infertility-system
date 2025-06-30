package com.emmkay.infertility_system_api.modules.email.dto.request;

import com.emmkay.infertility_system_api.modules.email.enums.EmailType;
import lombok.Builder;
import lombok.Data;

import java.util.Map;

@Data
@Builder
public class EmailRequest {
    private String toEmail;
    private String subject;
    private EmailType emailType;
    private Map<String, String> params;
}
