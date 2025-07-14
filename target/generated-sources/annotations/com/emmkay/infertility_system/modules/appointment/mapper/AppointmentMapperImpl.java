package com.emmkay.infertility_system.modules.appointment.mapper;

import com.emmkay.infertility_system.modules.appointment.dto.request.AppointmentCreateRequest;
import com.emmkay.infertility_system.modules.appointment.dto.request.AppointmentUpdateRequest;
import com.emmkay.infertility_system.modules.appointment.dto.request.ChangeAppointmentByCustomerRequest;
import com.emmkay.infertility_system.modules.appointment.dto.response.AppointmentResponse;
import com.emmkay.infertility_system.modules.appointment.entity.Appointment;
import com.emmkay.infertility_system.modules.doctor.entity.Doctor;
import com.emmkay.infertility_system.modules.treatment.entity.TreatmentStep;
import com.emmkay.infertility_system.modules.user.entity.User;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-07-14T11:23:13+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 24.0.1 (Oracle Corporation)"
)
@Component
public class AppointmentMapperImpl implements AppointmentMapper {

    @Override
    public AppointmentResponse toAppointmentResponse(Appointment appointment) {
        if ( appointment == null ) {
            return null;
        }

        AppointmentResponse.AppointmentResponseBuilder appointmentResponse = AppointmentResponse.builder();

        appointmentResponse.customerName( appointmentCustomerFullName( appointment ) );
        appointmentResponse.customerEmail( appointmentCustomerEmail( appointment ) );
        appointmentResponse.doctorName( appointmentDoctorUsersFullName( appointment ) );
        appointmentResponse.doctorEmail( appointmentDoctorUsersEmail( appointment ) );
        appointmentResponse.step( appointmentTreatmentStepStepType( appointment ) );
        appointmentResponse.id( appointment.getId() );
        appointmentResponse.appointmentDate( appointment.getAppointmentDate() );
        appointmentResponse.shift( appointment.getShift() );
        appointmentResponse.status( appointment.getStatus() );
        appointmentResponse.notes( appointment.getNotes() );
        appointmentResponse.requestedShift( appointment.getRequestedShift() );
        appointmentResponse.requestedDate( appointment.getRequestedDate() );
        appointmentResponse.createdAt( appointment.getCreatedAt() );
        appointmentResponse.purpose( appointment.getPurpose() );

        return appointmentResponse.build();
    }

    @Override
    public void requestChangeAppointment(Appointment appointment, ChangeAppointmentByCustomerRequest request) {
        if ( request == null ) {
            return;
        }

        appointment.setRequestedDate( request.getRequestedDate() );
        appointment.setRequestedShift( request.getRequestedShift() );
        appointment.setNotes( request.getNotes() );
    }

    @Override
    public Appointment toAppointment(AppointmentCreateRequest request) {
        if ( request == null ) {
            return null;
        }

        Appointment.AppointmentBuilder appointment = Appointment.builder();

        appointment.appointmentDate( request.getAppointmentDate() );
        appointment.shift( request.getShift() );
        appointment.notes( request.getNotes() );
        appointment.purpose( request.getPurpose() );

        return appointment.build();
    }

    @Override
    public void updateAppointment(Appointment appointment, AppointmentUpdateRequest request) {
        if ( request == null ) {
            return;
        }

        appointment.setNotes( request.getNotes() );
    }

    private String appointmentCustomerFullName(Appointment appointment) {
        if ( appointment == null ) {
            return null;
        }
        User customer = appointment.getCustomer();
        if ( customer == null ) {
            return null;
        }
        String fullName = customer.getFullName();
        if ( fullName == null ) {
            return null;
        }
        return fullName;
    }

    private String appointmentCustomerEmail(Appointment appointment) {
        if ( appointment == null ) {
            return null;
        }
        User customer = appointment.getCustomer();
        if ( customer == null ) {
            return null;
        }
        String email = customer.getEmail();
        if ( email == null ) {
            return null;
        }
        return email;
    }

    private String appointmentDoctorUsersFullName(Appointment appointment) {
        if ( appointment == null ) {
            return null;
        }
        Doctor doctor = appointment.getDoctor();
        if ( doctor == null ) {
            return null;
        }
        User users = doctor.getUsers();
        if ( users == null ) {
            return null;
        }
        String fullName = users.getFullName();
        if ( fullName == null ) {
            return null;
        }
        return fullName;
    }

    private String appointmentDoctorUsersEmail(Appointment appointment) {
        if ( appointment == null ) {
            return null;
        }
        Doctor doctor = appointment.getDoctor();
        if ( doctor == null ) {
            return null;
        }
        User users = doctor.getUsers();
        if ( users == null ) {
            return null;
        }
        String email = users.getEmail();
        if ( email == null ) {
            return null;
        }
        return email;
    }

    private String appointmentTreatmentStepStepType(Appointment appointment) {
        if ( appointment == null ) {
            return null;
        }
        TreatmentStep treatmentStep = appointment.getTreatmentStep();
        if ( treatmentStep == null ) {
            return null;
        }
        String stepType = treatmentStep.getStepType();
        if ( stepType == null ) {
            return null;
        }
        return stepType;
    }
}
