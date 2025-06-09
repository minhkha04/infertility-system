package com.emmkay.infertility_system_api.repository;

import com.emmkay.infertility_system_api.dto.projection.ManagerDashboardWorkScheduleDoctorTodayProjection;
import com.emmkay.infertility_system_api.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DoctorScheduleRepository extends JpaRepository<Doctor, String> {

    @Query("""
                SELECT
                    d.id AS doctorId,
                    u.fullName AS doctorName,
                    u.phoneNumber AS phoneNumber,
                    ws.shift AS shift,
                    COUNT(a.id) AS totalAppointments,
                    SUM(CASE WHEN a.status = 'COMPLETED' THEN 1 ELSE 0 END) AS completedAppointments
                FROM Doctor d
                JOIN User u ON d.id = u.id
                JOIN WorkSchedule ws ON ws.doctor.id = d.id
                LEFT JOIN Appointment a ON a.doctor.id = d.id AND a.appointmentDate = LOCAL_DATE
                WHERE ws.workDate = LOCAL_DATE
                GROUP BY d.id, u.fullName, u.phoneNumber, ws.shift
                ORDER BY u.fullName
            """)
    List<ManagerDashboardWorkScheduleDoctorTodayProjection> getDoctorScheduleToday();
}
