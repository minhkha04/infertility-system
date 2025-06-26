package com.emmkay.infertility_system_api.modules.treatment.repository;

import com.emmkay.infertility_system_api.modules.treatment.entity.TreatmentStep;
import com.emmkay.infertility_system_api.modules.treatment.enums.TreatmentStepStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface TreatmentStepRepository extends JpaRepository<TreatmentStep, Long> {

    @Query("update TreatmentStep t set t.status = :status where t.record.id = :recordId and t.status in :statuses")
    @Modifying
    void updateStatusByRecordIdAndStatusIn(Long recordId, Collection<TreatmentStepStatus> statuses, TreatmentStepStatus status);

    List<TreatmentStep> findByRecordIdOrderByIdAsc(Long recordId);

    List<TreatmentStep> findByRecord_Id(Long recordId);

    Optional<TreatmentStep> findByRecord_IdAndStageOrderIndex(Long recordId, Integer stageOrderIndex);
}
