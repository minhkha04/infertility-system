package com.emmkay.infertility_system_api.modules.reminder.service;

import com.emmkay.infertility_system_api.modules.appointment.entity.Appointment;
import com.emmkay.infertility_system_api.modules.email.dto.request.EmailRequest;
import com.emmkay.infertility_system_api.modules.email.enums.EmailType;
import com.emmkay.infertility_system_api.modules.reminder.entity.Reminder;
import com.emmkay.infertility_system_api.modules.reminder.util.MessGenerateUtil;
import com.emmkay.infertility_system_api.modules.reminder.repository.ReminderRepository;
import com.emmkay.infertility_system_api.modules.email.service.EmailService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ReminderService {

    ReminderRepository reminderRepository;
    EmailService emailService;

    public void createReminderForAppointment(Appointment appointment) {
        Reminder reminder = Reminder.builder()
                .customer(appointment.getCustomer())
                .reminderDate(appointment.getAppointmentDate())
                .message(MessGenerateUtil.buildMess(appointment.getDoctor(), appointment.getShift(), appointment.getAppointmentDate(), appointment.getTreatmentStep().getStepType()))
                .appointment(appointment)
                .isSent(false)
                .build();
        reminderRepository.save(reminder);
    }

    @Scheduled(cron = "0 0/30 * * * *", zone = "Asia/Ho_Chi_Minh")
    public void sendReminders() {
        LocalDate reminderDate = LocalDate.now().plusDays(1);

        List<Reminder> reminders = reminderRepository.findByReminderDateAndIsSentFalseWithCustomer(reminderDate);
        reminders.forEach(reminder -> {
            log.info("Sending reminder to customer: {}", reminder.getCustomer().getFullName());
            String subject = "Thông báo lịch hẹn";
            EmailRequest emailRequest = EmailRequest.builder()
                    .toEmail(reminder.getCustomer().getEmail())
                    .subject(subject)
                    .emailType(EmailType.REMINDER_APPOINTMENT)
                    .params(Map.of(
                            "customerName", reminder.getCustomer().getFullName(),
                            "reminderMessage", reminder.getMessage()
                    ))
                    .build();
            try {
                emailService.sendMail(emailRequest);
                reminder.setIsSent(true);
            } catch (Exception e) {
                log.error("Failed to send reminder to customer: {}", reminder.getCustomer().getFullName());
            }
        });
        reminderRepository.saveAll(reminders);
    }

}
