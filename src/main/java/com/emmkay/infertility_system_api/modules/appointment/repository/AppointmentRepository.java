package com.emmkay.infertility_system_api.modules.appointment.repository;

import com.emmkay.infertility_system_api.modules.appointment.enums.AppointmentStatus;
import com.emmkay.infertility_system_api.modules.appointment.projection.AppointmentBasicProjection;
import com.emmkay.infertility_system_api.modules.appointment.entity.Appointment;
import com.emmkay.infertility_system_api.modules.dashboard.projection.DoctorTodayAppointmentProjection;
import com.emmkay.infertility_system_api.modules.shared.enums.Shift;
import com.emmkay.infertility_system_api.modules.treatment.entity.TreatmentStep;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Collection;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    @Query("""
                SELECT COUNT(a) FROM Appointment a
                WHERE a.doctor.id = :doctorId
                  AND DATE(a.appointmentDate) = :date
                  AND a.shift = :shift
                  AND a.status <> 'CANCELLED'
            """)
    int countActiveByDoctorIdAndDateAndShift(@Param("doctorId") String doctorId, @Param("date") LocalDate date, @Param("shift") Shift shift);

    @Query("update Appointment a set a.status = :status where a.treatmentStep = :treatmentStep")
    @Modifying
    void updateStatusByTreatmentStep(String status, TreatmentStep treatmentStep);

    boolean existsByStatusInAndTreatmentStep(Collection<String> statuses, TreatmentStep treatmentStep);

    @Query(value = """
                SELECT
                       a.id AS id,
                       a.customer.fullName AS customerName,
                       a.doctor.users.fullName AS doctorName,
                       a.appointmentDate AS appointmentDate,
                       shift AS shift,
                       a.status AS status
                FROM Appointment a
                WHERE
                       (:customerId IS NULL OR a.customer.id = :customerId)
                       AND (:doctorId IS NULL OR a.doctor.id = :doctorId)
                       AND (:date IS NULL OR a.appointmentDate = :date)
                       AND (:status IS NULL OR a.status = :status)
                       AND (:stepId IS NULL OR a.status = :stepId)
                ORDER BY a.appointmentDate DESC
            """)
    Page<AppointmentBasicProjection> searchAppointments(Long stepId, String customerId, String doctorId, LocalDate date, AppointmentStatus status, Pageable pageable);

    @Query("""
                SELECT
                    a.id AS id,
                    a.customer.fullName AS customerName,
                    a.shift AS shift,
                    a.status AS status
                FROM Appointment a
                WHERE a.doctor.id = :doctorId
                  AND a.appointmentDate = CURRENT_DATE
            """)
    Page<DoctorTodayAppointmentProjection> findTodayAppointmentsByDoctorId(String doctorId, Pageable pageable);
}
