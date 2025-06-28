package com.emmkay.infertility_system_api.modules.authentication.otp;

import com.emmkay.infertility_system_api.modules.authentication.entity.EmailOtp;
import com.emmkay.infertility_system_api.modules.authentication.repository.EmailOtpRepository;
import com.emmkay.infertility_system_api.modules.shared.email.EmailService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Random;

@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OtpSenderService {

    EmailOtpRepository emailOtpRepository;
    EmailService emailService;

    public void generateAndSendOtp(String email, String type) {
        emailOtpRepository.deleteById(email);
        String otp = String.format("%06d", new Random().nextInt(999999));
        emailOtpRepository.save(EmailOtp.builder()
                .email(email)
                .otp(otp)
                .expiryTime(LocalDateTime.now().plusMinutes(5))
                .build());
        String subject = "Mã xác thực OTP - " + type;
        String htmlContent = """
                <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <p>Xin chào,</p>
                
                    <p>Quý khách đang thực hiện một yêu cầu liên quan đến <strong>%s</strong> tại 
                    <strong style="color:#FC6A40;">Trung tâm điều trị hiếm muộn New Life</strong>.</p>
                
                    <p>Vui lòng sử dụng mã OTP bên dưới để xác thực yêu cầu:</p>
                
                    <p style="font-size: 24px; font-weight: bold; color: #FC6A40;">%s</p>
                
                    <p>Mã có hiệu lực trong vòng <strong>5 phút</strong>. 
                    Vui lòng không chia sẻ mã này với bất kỳ ai vì lý do bảo mật.</p>
                
                    <table width="100%%" style="margin-top: 30px;">
                        <tr>
                            <td style="vertical-align: top;">
                                <p>Trân trọng,<br/>
                                Hệ thống xác thực tự động<br/>
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
                """.formatted(type, otp);
        emailService.sendEmail(email, subject, htmlContent);
    }
}
