package com.emmkay.infertility_system_api.modules.reminder.service;

import com.emmkay.infertility_system_api.modules.appointment.entity.Appointment;
import com.emmkay.infertility_system_api.modules.appointment.enums.AppointmentStatus;
import com.emmkay.infertility_system_api.modules.doctor.entity.Doctor;
import com.emmkay.infertility_system_api.modules.reminder.entity.Reminder;
import com.emmkay.infertility_system_api.modules.shared.enums.Shift;
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

    private String generateShift(Shift shift) {
        return switch (shift) {
            case MORNING -> "sáng";
            case AFTERNOON -> "chiều";
            default -> throw new AppException(ErrorCode.INVALID_SHIFT_VALUE);
        };
    }

    private String buildMess(Doctor doctor, Shift shift, LocalDate date, String step) {

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("EEEE, 'ngày' d 'tháng' M, yyyy", new Locale("vi", "VN"));
        String formattedDate = date.format(formatter);

        return "Nhắc nhở: Bạn có lịch hẹn với bác sĩ " + doctor.getUsers().getFullName()
                + " vào " + formattedDate + " buổi " + generateShift(shift) + " cho việc " + step + ".";
    }

    public void createReminderForAppointment(Appointment appointment) {
        Reminder reminder = Reminder.builder()
                .customer(appointment.getCustomer())
                .reminderDate(appointment.getAppointmentDate())
                .message(buildMess(appointment.getDoctor(), appointment.getShift(), appointment.getAppointmentDate(), appointment.getTreatmentStep().getStepType()))
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
                    <html>
                    <body style="font-family: Arial, sans-serif; line-height: 1.6;">
                    
                        <p>Kính gửi %s,</p>
                    
                        <p>Chúng tôi xin gửi lời nhắc lịch hẹn sắp tới của Quý khách tại  
                        <strong style="color:#FC6A40;">Trung tâm điều trị hiếm muộn New Life</strong>.</p>
                    
                        <p><strong>Thông tin chi tiết:</strong><br/>
                        %s</p>
                    
                        <p><strong>Khung giờ làm việc:</strong><br/>
                        - Sáng: 08:00 – 12:00<br/>
                        - Chiều: 13:00 – 17:00</p>
                    
                        <p>Quý khách vui lòng đến đúng giờ để quá trình thăm khám diễn ra thuận lợi.</p>
                    
                        <table width="100%%" style="margin-top: 20px;">
                            <tr>
                                <td style="vertical-align: top;">
                                    <p>Trân trọng,<br/>
                                    Đội ngũ chăm sóc khách hàng<br/>
                                    <span style="color:#FC6A40; font-weight:bold;">Trung tâm điều trị hiếm muộn New Life</span><br/>
                                    Email: <a href="mailto:infertilitytreatmentmonitoring@gmail.com">infertilitytreatmentmonitoring@gmail.com</a></p>
                                </td>
                                <td style="text-align: right;">
                                    <img src="https://res.cloudinary.com/di6hi1r0g/image/upload/v1748665959/icon_pch2gc.png" alt="New Life Logo" style="width: 100px; height: auto;"/>
                                </td>
                            </tr>
                        </table>
                    </body>
                    </html>
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
