package com.emmkay.infertility_system_api.repository;

import com.emmkay.infertility_system_api.entity.WorkSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

@Repository
public interface WorkScheduleRepository extends JpaRepository<WorkSchedule, Long> {
    boolean existsByDoctorIdAndWorkDate(String doctorId, LocalDate workDate);

    List<WorkSchedule> findAllByDoctorIdAndWorkDateBetweenOrderByWorkDateAsc(String doctorId, LocalDate workDateAfter, LocalDate workDateBefore);


    List<WorkSchedule> findByWorkDateAndShiftIn(LocalDate workDate, Collection<String> shifts);

    List<WorkSchedule> findByDoctorIdAndWorkDateBetween(String doctorId, LocalDate workDateAfter, LocalDate workDateBefore);

    boolean existsByDoctorIdAndWorkDateAndShift(String doctorId, LocalDate workDate, String shift);
}
