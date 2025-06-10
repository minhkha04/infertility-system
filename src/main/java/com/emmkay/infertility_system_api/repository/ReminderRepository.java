package com.emmkay.infertility_system_api.repository;

import com.emmkay.infertility_system_api.entity.Appointment;
import com.emmkay.infertility_system_api.entity.Reminder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReminderRepository extends JpaRepository<Reminder, Long> {

    @Modifying
    @Query("DELETE FROM Reminder r WHERE r.appointment.treatmentStep.record.id = :recordId")
    void deleteByRecordId(@Param("recordId") Long recordId);


    @Query("SELECT r FROM Reminder r JOIN FETCH r.customer WHERE r.reminderDate = :reminderDate AND r.isSent = false")
    List<Reminder> findByReminderDateAndIsSentFalseWithCustomer(LocalDate reminderDate);

    void deleteByAppointment(Appointment appointment);

    Optional<Reminder> getRemindersByAppointment(Appointment appointment);
}
