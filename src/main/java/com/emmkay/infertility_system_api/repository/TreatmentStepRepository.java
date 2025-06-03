package com.emmkay.infertility_system_api.repository;

import com.emmkay.infertility_system_api.entity.TreatmentStep;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Collection;

@Repository
public interface TreatmentStepRepository extends JpaRepository<TreatmentStep, Long> {

    @Query("update TreatmentStep t set t.status = :status where t.record.id = :recordId and t.status in :statuses")
    @Modifying
    void updateStatusByRecordIdAndStatusIn(Long recordId, Collection<String> statuses,  String status);

    Collection<Object> findByRecordId(Long recordId);
}
