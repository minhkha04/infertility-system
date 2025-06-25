package com.emmkay.infertility_system_api.modules.treatment.repository;

import com.emmkay.infertility_system_api.modules.treatment.entity.TreatmentRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TreatmentRecordRepository extends JpaRepository<TreatmentRecord, Long> {

    Optional<TreatmentRecord> findByIdAndCustomerId(Long id, String customerId);

    List<TreatmentRecord> findByCustomerId(String customerId);

    List<TreatmentRecord> findByDoctorId(String doctorId);

}
