package com.emmkay.infertility_system_api.modules.email.service;

import com.emmkay.infertility_system_api.modules.email.dto.request.EmailRequest;
import com.emmkay.infertility_system_api.modules.email.helper.TemplateRenderer;
import com.emmkay.infertility_system_api.modules.shared.exception.AppException;
import com.emmkay.infertility_system_api.modules.shared.exception.ErrorCode;
import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class EmailService {

    @NonFinal
    @Value("${resend.mail.api.key}")
    String API_KEY_RESEND;

    TemplateRenderer templateRenderer;

    private String generateHtml(EmailRequest request) {
        String html;
        switch (request.getEmailType()) {
            case OTP_VERIFICATION -> html = templateRenderer.render("otp.html",request.getParams());
            case REMINDER_APPOINTMENT -> html = templateRenderer.render("reminder.html",request.getParams());
            default -> throw new AppException(ErrorCode.INVALID_EMAIL_TYPE);
        }
        return html;
    }

    public void sendMail(EmailRequest emailRequest) {
        Resend resend = new Resend(API_KEY_RESEND);

        CreateEmailOptions params = CreateEmailOptions.builder()
                .from("New Life <noreply@techleaf.pro>")
                .to(emailRequest.getToEmail())
                .subject(emailRequest.getSubject())
                .html(generateHtml(emailRequest))
                .build();

        try {
            resend.emails().send(params);
        } catch (ResendException e) {
            log.info("Error sending email via Resend: {}", e.getMessage());
            throw new AppException(ErrorCode.EMAIL_SEND_FAILED);
        }
    }
}
