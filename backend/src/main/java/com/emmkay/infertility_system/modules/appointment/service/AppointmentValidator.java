package com.emmkay.infertility_system.modules.appointment.service;

import com.emmkay.infertility_system.modules.appointment.entity.Appointment;
import com.emmkay.infertility_system.modules.appointment.enums.AppointmentStatus;
import com.emmkay.infertility_system.modules.doctor.service.DoctorService;
import com.emmkay.infertility_system.modules.shared.enums.RoleName;
import com.emmkay.infertility_system.modules.shared.enums.Shift;
import com.emmkay.infertility_system.modules.shared.exception.AppException;
import com.emmkay.infertility_system.modules.shared.exception.ErrorCode;
import com.emmkay.infertility_system.modules.shared.security.CurrentUserUtils;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class AppointmentValidator {

    DoctorService doctorService;

    //    authorize
    public void validateCanChangeAppointment(Appointment appointment) {
        String scope = CurrentUserUtils.getCurrentScope();
        String currentUserId = CurrentUserUtils.getCurrentUserId();
        if (scope == null || currentUserId == null) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        RoleName roleName = RoleName.valueOf(scope.toUpperCase());
        switch (roleName) {
            case CUSTOMER:
                if (!appointment.getCustomer().getId().equalsIgnoreCase(currentUserId)) {
                    throw new AppException(ErrorCode.UNAUTHORIZED);
                }
                break;
            case DOCTOR:
                if (!appointment.getDoctor().getId().equalsIgnoreCase(currentUserId)) {
                    throw new AppException(ErrorCode.UNAUTHORIZED);
                }
                break;
            case MANAGER:
                break;
            default:
                throw new AppException(ErrorCode.UNAUTHORIZED);
        }
    }

    //    check work date doctor and status appointment
    public void validateAppointmentAvailableForChange(Appointment appointment, LocalDate dateChange, Shift shiftChange) {
//         Kiểm tra ca đó có nằm trong lịch làm việc rảnh không
        String doctorId = appointment.getDoctor().getId();
        boolean isAvailable = doctorService.isDoctorAvailable(doctorId, dateChange, shiftChange);

        if (!isAvailable) {
            throw new AppException(ErrorCode.DOCTOR_NOT_AVAILABLE);
        }
        if (appointment.getStatus() == AppointmentStatus.COMPLETED
                || appointment.getStatus() == AppointmentStatus.CANCELLED) {
            throw new AppException(ErrorCode.CAN_NOT_BE_UPDATED_STATUS);
        }
    }

}
