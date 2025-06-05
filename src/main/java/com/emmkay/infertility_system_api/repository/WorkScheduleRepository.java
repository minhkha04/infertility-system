package com.emmkay.infertility_system_api.repository;

import com.emmkay.infertility_system_api.entity.WorkSchedule;
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

    List<WorkSchedule> findAllByDoctorIdAndWorkDateBetweenOrderByWorkDateAsc(String doctorId, LocalDate workDateAfter, LocalDate workDateBefore);

    List<WorkSchedule> findByWorkDateAndShiftIn(LocalDate workDate, Collection<String> shifts);

    List<WorkSchedule> findByDoctorIdAndWorkDateBetween(String doctorId, LocalDate workDateAfter, LocalDate workDateBefore);

    boolean existsByDoctorIdAndWorkDateAndShift(String doctorId, LocalDate workDate, String shift);

    Optional<WorkSchedule> findByDoctorIdAndWorkDate(String doctorId, LocalDate workDate);

    @Modifying
    @Query("DELETE FROM WorkSchedule ws WHERE ws.doctor.id = :doctorId AND ws.workDate BETWEEN :startDate AND :endDate")
    int deleteSchedulesByDoctorIdAndMonth(
            @Param("doctorId") String doctorId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    Optional<WorkSchedule> findByWorkDateAndDoctorId(LocalDate workDate, String doctorId);

    List<WorkSchedule> findAllByWorkDate(LocalDate workDate);
}
