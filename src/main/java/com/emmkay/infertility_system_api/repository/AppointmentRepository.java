package com.emmkay.infertility_system_api.repository;

import com.emmkay.infertility_system_api.dto.projection.AppointmentInNext7DayProjection;
import com.emmkay.infertility_system_api.dto.response.AppointmentResponse;
import com.emmkay.infertility_system_api.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {


    @Modifying
    @Query(value = """
                UPDATE Appointment a
                SET a.status = :status
                WHERE a.treatmentStep.record.id = :recordId
                AND a.status IN :statuses
            """)
    void updateStatusByRecordIdNative(
            @Param("recordId") Long recordId,
            @Param("statuses") Collection<String> statuses,
            @Param("status") String status
    );

    @Query("""
                SELECT COUNT(a) FROM Appointment a
                WHERE a.doctor.id = :doctorId
                  AND DATE(a.appointmentDate) = :date
                  AND a.shift = :shift
                  AND a.status <> 'CANCELLED'
            """)
    int countActiveByDoctorIdAndDateAndShift(@Param("doctorId") String doctorId, @Param("date") LocalDate date, @Param("shift") String shift);

    List<Appointment> findAppointmentByCustomerId(String customerId);

    List<Appointment> findAppointmentByCustomerIdAndStatusNot(String customerId, String status);

    List<Appointment> findAppointmentByDoctorIdAndStatusNot(String doctorId, String status);

    List<Appointment> findAppointmentByDoctorIdAndStatusNotAndAppointmentDate(String doctorId, String status, LocalDate appointmentDate);

    List<Appointment> findAllByOrderByAppointmentDateAsc();

    List<Appointment> findAllByStatusAndDoctor_Id(String status, String doctorId);

    @Query(value = """
                    SELECT
                        COUNT(a) AS totalAppointment,
                        a.appointmentDate AS appointmentDate
                    FROM Appointment AS a
                    WHERE a.doctor.id = :doctorId
                        AND a.appointmentDate BETWEEN CURRENT_DATE AND :endDate
                        AND a.status = 'CONFIRMED'
                    GROUP BY a.appointmentDate
            """)
    List<AppointmentInNext7DayProjection> getAppointmentInNext7Day(String doctorId, LocalDate endDate);

    List<Appointment> findAllByAppointmentDateIsOrderByAppointmentDateAsc(LocalDate appointmentDate);
}
