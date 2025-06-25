package com.emmkay.infertility_system_api.modules.dashboard.repository;

import com.emmkay.infertility_system_api.modules.dashboard.projection.ManagerWorkScheduleDoctorTodayProjection;
import com.emmkay.infertility_system_api.modules.dashboard.view.ManagerWorkStatisticsTodayView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ManagerWorkStatisticsTodayRepository extends JpaRepository<ManagerWorkStatisticsTodayView, Integer> {


    @Query("""
                SELECT
                    d.id AS doctorId,
                    d.users.fullName AS doctorName,
                    d.users.phoneNumber AS phoneNumber,
                    ws.shift AS shift,
                    COUNT(a.id) AS totalAppointments,
                    SUM(CASE WHEN a.status = 'COMPLETED' THEN 1 ELSE 0 END) AS completedAppointments,
                    d.users.avatarUrl AS avatarUrl
                FROM Doctor d
                JOIN WorkSchedule ws ON ws.doctor.id = d.id
                LEFT JOIN Appointment a
                            ON a.doctor.id = d.id
                            AND a.appointmentDate = LOCAL_DATE
                            AND a.status != 'CANCELLED'
                WHERE ws.workDate = LOCAL_DATE
                GROUP BY d.id, d.users.fullName, d.users.phoneNumber, ws.shift
                ORDER BY d.users.fullName
            """)
    List<ManagerWorkScheduleDoctorTodayProjection> getDoctorScheduleToday();
}
