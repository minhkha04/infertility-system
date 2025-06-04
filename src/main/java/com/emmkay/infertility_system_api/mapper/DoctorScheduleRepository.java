package com.emmkay.infertility_system_api.mapper;

import com.emmkay.infertility_system_api.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DoctorScheduleRepository extends JpaRepository<Doctor, String> {

    @Query(value = """
                SELECT \s
                    d.id AS doctor_id,
                    u.full_name AS doctor_name,
                    u.phone_number,
                    ws.shift,
                    COUNT(a.id) AS total_appointments,
                    SUM(CASE WHEN a.status = 'COMPLETED' THEN 1 ELSE 0 END) AS completed_appointments
                FROM doctors d
                JOIN users u ON u.id = d.id
                INNER JOIN work_schedule ws\s
                    ON ws.doctor_id = d.id\s
                    AND ws.work_date = CURDATE()
                LEFT JOIN appointment a\s
                    ON a.doctor_id = d.id\s
                    AND a.appointment_date = CURDATE()
                GROUP BY d.id, u.full_name, u.phone_number, ws.shift
                ORDER BY u.full_name;
            """, nativeQuery = true)
    List<Object[]> getDoctorScheduleToday();
}
