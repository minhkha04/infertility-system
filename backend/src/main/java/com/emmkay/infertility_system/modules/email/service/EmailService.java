package com.emmkay.infertility_system.modules.email.service;

import com.emmkay.infertility_system.modules.email.dto.request.EmailRequest;
import com.emmkay.infertility_system.modules.email.helper.TemplateRenderer;
import com.emmkay.infertility_system.modules.shared.exception.AppException;
import com.emmkay.infertility_system.modules.shared.exception.ErrorCode;
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
            case REGISTER_SERVICE -> html = templateRenderer.render("registerServiceSuccess.html",request.getParams());
            case RECORD_SUCCESS -> html = templateRenderer.render("recordSuccess.html",request.getParams());
            case RECORD_CANCEL -> html = templateRenderer.render("recordCancel.html",request.getParams());
            case APPOINTMENT_CHANGE_DOCTOR_MANAGER -> html = templateRenderer.render("appointmentChangeDoctorManager.html",request.getParams());
            case APPOINTMENT_CHANGE_CUSTOMER -> html = templateRenderer.render("appointmentChangeCustomer.html",request.getParams());
            case APPOINTMENT_CHANGE_SUCCESS -> html = templateRenderer.render("appointmentChangeSuccess.html",request.getParams());
            case APPOINTMENT_CHANGE_FAIL -> html = templateRenderer.render("appointmentChangeFail.html",request.getParams());
            case APPOINTMENT_AUTO_REVERT -> html = templateRenderer.render("appointmentAutoRevert.html",request.getParams());
            case PAYMENT_SUCCESS -> html = templateRenderer.render("paymentSuccess.html",request.getParams());
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
