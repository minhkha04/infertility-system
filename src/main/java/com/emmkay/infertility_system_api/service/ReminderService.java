package com.emmkay.infertility_system_api.service;

import com.emmkay.infertility_system_api.entity.Appointment;
import com.emmkay.infertility_system_api.entity.Doctor;
import com.emmkay.infertility_system_api.entity.Reminder;
import com.emmkay.infertility_system_api.exception.AppException;
import com.emmkay.infertility_system_api.exception.ErrorCode;
import com.emmkay.infertility_system_api.repository.ReminderRepository;
import com.emmkay.infertility_system_api.repository.AppointmentRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ReminderService {

    AppointmentRepository appointmentRepository;
    ReminderRepository reminderRepository;
    EmailService emailService;

    String buildMess(Doctor doctor, String shift, LocalDate date, String purpose) {

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("EEEE, MMMM d, yyyy", Locale.ENGLISH);
        String formattedDate = date.format(formatter);

        return "Reminder: You have appointment with Dr. " + doctor.getUsers().getFullName()
                + " on " + formattedDate + " at " + shift + " for " + purpose + ".";
    }

    public void createReminderForAppointment(Appointment appointment) {
        Reminder reminder = Reminder.builder()
                .customer(appointment.getCustomer())
                .reminderDate(appointment.getAppointmentDate())
                .message(buildMess(appointment.getDoctor(), appointment.getShift(), appointment.getAppointmentDate(), appointment.getPurpose()))
                .step(appointment.getTreatmentStep())
                .isSent(false)
                .build();
        reminderRepository.save(reminder);
    }

    public void deleteByRecordId(Long recordId) {
        reminderRepository.deleteByRecordId(recordId);
    }

    public void updateReminder(Appointment appointment) {
        Reminder reminder = reminderRepository.findByStepId(appointment.getTreatmentStep().getId())
                .orElseThrow(() -> new AppException(ErrorCode.REMINDER_NOT_FOUND));
        reminder = Reminder.builder()
                .reminderDate(appointment.getAppointmentDate())
                .message(buildMess(appointment.getDoctor(), appointment.getShift(), appointment.getAppointmentDate(), appointment.getPurpose()))
                .step(appointment.getTreatmentStep())
                .isSent(false)
                .build();
        reminderRepository.save(reminder);
    }

    @Scheduled(cron = "0 0 8 * * *")
    public void sendReminders() {
        LocalDate reminderDate = LocalDate.now().plusDays(2);

        List<Reminder> reminders = reminderRepository.findByReminderDateAndIsSentFalse(reminderDate);

        reminders.forEach(reminder -> {
            String subject = "Appointment Reminder";
            String body = """
                    Hello %s,
                    
                    This is a friendly reminder for your upcoming appointment.
                    
                    ➤ Details:
                    %s
                    
                    Please arrive on time.
                    """.formatted(reminder.getCustomer().getFullName(), reminder.getMessage());
            try {
                emailService.sendEmail(reminder.getCustomer().getEmail(), subject, body);
                reminder.setIsSent(true);
            } catch (Exception e) {
                log.error("Failed to send reminder to customer: {}", reminder.getCustomer().getFullName());
            }
        });
        reminderRepository.saveAll(reminders);
    }

}
