package com.emmkay.infertility_system.modules.schedule.repository;

import com.emmkay.infertility_system.modules.doctor.projection.DoctorSelectProjection;
import com.emmkay.infertility_system.modules.schedule.entity.WorkSchedule;
import com.emmkay.infertility_system.modules.schedule.projection.WorkScheduleDateShiftProjection;
import com.emmkay.infertility_system.modules.shared.enums.Shift;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface WorkScheduleRepository extends JpaRepository<WorkSchedule, Long> {


    List<WorkScheduleDateShiftProjection> findAllByDoctorIdAndWorkDateBetweenOrderByWorkDateAsc(String doctorId, LocalDate startDate, LocalDate endDate);

    boolean existsByDoctorIdAndWorkDateAndShift(String doctorId, LocalDate workDate, Shift shift);

    Optional<WorkSchedule> findByDoctorIdAndWorkDate(String doctorId, LocalDate workDate);

    @Modifying
    @Query("DELETE FROM WorkSchedule ws WHERE ws.doctor.id = :doctorId AND ws.workDate BETWEEN :startDate AND :endDate")
    int deleteSchedulesByDoctorIdAndMonth(
            @Param("doctorId") String doctorId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    Optional<WorkSchedule> findByWorkDateAndDoctorId(LocalDate workDate, String doctorId);


    List<WorkSchedule> findByDoctorIdAndWorkDateGreaterThanEqual(String doctorId, LocalDate workDateIsGreaterThan);

    @Query("""
                    SELECT
                        d.id AS id,
                        d.users.fullName AS fullName
                    FROM WorkSchedule ws
                    JOIN ws.doctor d
                    WHERE d.isPublic = TRUE
                        AND (ws.workDate = :date)
                        AND (ws.shift IN :shifts)
                        AND (d.users.isRemoved = FALSE)
            """)
    List<DoctorSelectProjection> getDoctorsForRegister(LocalDate date, List<Shift> shifts);

    Optional<Object> findByDoctorIdAndWorkDateAndShift(String doctorId, LocalDate workDate, Shift shift);

    Optional<Object> findByDoctorIdAndWorkDateAndShiftIn(String doctorId, LocalDate workDate, Collection<Shift> shifts);
}
