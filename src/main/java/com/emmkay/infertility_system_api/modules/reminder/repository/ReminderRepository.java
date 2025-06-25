package com.emmkay.infertility_system_api.modules.reminder.repository;

import com.emmkay.infertility_system_api.modules.appointment.entity.Appointment;
import com.emmkay.infertility_system_api.modules.reminder.entity.Reminder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ReminderRepository extends JpaRepository<Reminder, Long> {

    @Query("SELECT r FROM Reminder r JOIN FETCH r.customer WHERE r.reminderDate = :reminderDate AND r.isSent = false")
    List<Reminder> findByReminderDateAndIsSentFalseWithCustomer(LocalDate reminderDate);

    void deleteByAppointment(Appointment appointment);

    void deleteByAppointment_Id(Long appointmentId);
}
