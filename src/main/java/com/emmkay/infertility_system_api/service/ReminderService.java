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

     String generateShift(String shift) {
        return switch (shift.toUpperCase()) {
            case "MORNING" -> "SÁNG";
            case "AFTERNOON" -> "CHIỀU";
            case "FULL_DAY" -> "CẢ NGÀY";
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

    public void deleteByRecordId(Long recordId) {
        reminderRepository.deleteByRecordId(recordId);
    }

    public void updateReminder(Appointment appointment) {
        Reminder reminder = reminderRepository.getRemindersByAppointment(appointment)
                .orElseThrow(() -> new AppException(ErrorCode.REMINDER_NOT_FOUND));

        reminder = Reminder.builder()
                .reminderDate(appointment.getAppointmentDate())
                .message(buildMess(appointment.getDoctor(), appointment.getShift(), appointment.getAppointmentDate(), appointment.getPurpose()))
                .appointment(appointment)
                .isSent(false)
                .build();
        reminderRepository.save(reminder);
    }

    @Scheduled(cron = "0 0 8 * * *", zone = "Asia/Ho_Chi_Minh")
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
