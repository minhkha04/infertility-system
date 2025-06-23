package com.emmkay.infertility_system_api.modules.doctor.repository;

import com.emmkay.infertility_system_api.modules.doctor.projection.DoctorStatisticsProjection;
import com.emmkay.infertility_system_api.modules.doctor.projection.DoctorBasicProjection;
import com.emmkay.infertility_system_api.modules.doctor.entity.Doctor;
import com.emmkay.infertility_system_api.modules.doctor.projection.DoctorSelectProjection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, String> {

    @EntityGraph(attributePaths = {"users"})
    List<Doctor> findAll();

    @EntityGraph(attributePaths = {"users"})
    Optional<Doctor> findById(String id);

    @Query(value = """
            
            SELECT d.avgRating AS avgRating,
                   d.patients AS patients,
                   d.workShiftsThisMonth AS workShiftsThisMonth
            FROM DoctorDashboardStatsView d
            WHERE d.doctorId = :doctorId
            """)
    Optional<DoctorStatisticsProjection> getDoctorDashboardStats(@Param("doctorId") String doctorId);

    @Query(value = """
                SELECT  u.fullName AS fullName,
                        u.id AS id,
                        u.avatarUrl AS avatarUrl,
                        d.qualifications AS qualifications,
                        d.experienceYears AS experienceYears,
                        d.specialty AS specialty,
                        COALESCE(ROUND(AVG(f.rating), 1), 0) AS rate
                FROM Doctor d\s
                INNER JOIN User u\s
                ON d.id  = u.id
                LEFT JOIN Feedback f\s
                ON d.id = f.doctor.id
                   AND f.isApproved = TRUE
                WHERE d.isPublic = TRUE
                GROUP BY u.id, u.avatarUrl, d.qualifications, d.specialty, u.fullName, d.experienceYears
            """)
    Page<DoctorBasicProjection> getPublicDoctors(Pageable pageable);

    @Query("""
                SELECT d
                FROM Doctor d
                JOIN WorkSchedule ws ON d.id = ws.doctor.id
                LEFT JOIN Appointment a ON a.doctor.id = d.id
                    AND a.appointmentDate = :inputDate
                    AND a.shift = :shift
                    AND a.status NOT IN ('CANCELLED')
                WHERE
                    ws.workDate = :inputDate
                    AND (ws.shift = :shift OR ws.shift = 'FULL_DAY')
                    AND (d.isPublic = true)
                GROUP BY d
                HAVING COUNT(a.id) < 10
                ORDER BY COUNT(a.id)
            """)
    List<Doctor> findAvailableDoctorByDateAndShift(@Param("inputDate") LocalDate inputDate,
                                                   @Param("shift") String shift,
                                                   Pageable pageable);
    @Query(value = """
                SELECT
                    d.id AS id,
                    d.users.fullName AS fullName
                FROM Doctor d
                WHERE
                    (:isRemoved IS NULL OR d.users.isRemoved = :isRemoved)
                    AND (:isPublic IS NULL OR d.isPublic = :isPublic)
            """)
    List<DoctorSelectProjection> searchDoctors(boolean isRemoved, boolean isPublic);

    Optional<Doctor> findByIdAndIsPublic(String id, Boolean isPublic);
}
