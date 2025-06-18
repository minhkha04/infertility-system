package com.emmkay.infertility_system_api.modules.reminder.service;

import com.emmkay.infertility_system_api.modules.appointment.entity.Appointment;
import com.emmkay.infertility_system_api.modules.doctor.entity.Doctor;
import com.emmkay.infertility_system_api.modules.reminder.entity.Reminder;
import com.emmkay.infertility_system_api.modules.shared.exception.AppException;
import com.emmkay.infertility_system_api.modules.shared.exception.ErrorCode;
import com.emmkay.infertility_system_api.modules.reminder.repository.ReminderRepository;
import com.emmkay.infertility_system_api.modules.shared.email.EmailService;
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

    ReminderRepository reminderRepository;
    EmailService emailService;

     String generateShift(String shift) {
        return switch (shift.toUpperCase()) {
            case "MORNING" -> "sáng";
            case "AFTERNOON" -> "chiều";
            default -> throw new AppException(ErrorCode.INVALID_SHIFT_VALUE);
        };
    }

    String buildMess(Doctor doctor, String shift, LocalDate date, String purpose) {

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("EEEE, 'ngày' d 'tháng' M, yyyy", new Locale("vi", "VN"));
        String formattedDate = date.format(formatter);

        return "Nhắc nhở: Bạn có lịch hẹn với bác sĩ " + doctor.getUsers().getFullName()
                + " vào " + formattedDate + " buổi " + generateShift(shift) + " cho việc " + purpose + ".";
    }

    public void createReminderForAppointment(Appointment appointment) {
        Reminder reminder = Reminder.builder()
                .customer(appointment.getCustomer())
                .reminderDate(appointment.getAppointmentDate())
                .message(buildMess(appointment.getDoctor(), appointment.getShift(), appointment.getAppointmentDate(), appointment.getPurpose()))
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
            String body = """
                    Xin chào %s,
                    
                    Đây là lời nhắc nhở thân thiện về lịch hẹn sắp tới của bạn.
                    
                    ➤ Chi tiết:
                    %s
                    
                    Vui lòng đến đúng giờ.
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
