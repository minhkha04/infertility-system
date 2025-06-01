package com.emmkay.infertility_system_api.repository;

import com.emmkay.infertility_system_api.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    @Modifying
    @Query(value = """
    UPDATE appointment a
    JOIN treatment_step ts ON ts.id = a.treatment_step_id
    SET a.status = :status
    WHERE ts.record_id = :recordId
    AND a.status IN (:statuses)
    """, nativeQuery = true)
    void updateStatusByRecordIdNative(
            @Param("recordId") Long recordId,
            @Param("statuses") Collection<String> statuses,
            @Param("status") String status
    );

}
