package com.emmkay.infertility_system.modules.treatment.repository;

import com.emmkay.infertility_system.modules.treatment.entity.TreatmentRecord;
import com.emmkay.infertility_system.modules.treatment.entity.TreatmentStep;
import com.emmkay.infertility_system.modules.treatment.enums.TreatmentStepStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface TreatmentStepRepository extends JpaRepository<TreatmentStep, Long> {

    @Query("SELECT ts FROM TreatmentStep AS ts WHERE ts.record.id = :recordId ORDER BY ts.stage.orderIndex ASC")
    List<TreatmentStep> getAllByRecordId(Long recordId);

    boolean existsTreatmentStepByStageIdAndRecordIdAndStatusIn(Long stageId, Long recordId, Collection<TreatmentStepStatus> statuses);

    @Query("""
    SELECT ts
    FROM TreatmentStep ts
    WHERE ts.record.id = :recordId
    AND ts.stage.orderIndex < :orderIndex
    ORDER BY ts.stage.orderIndex DESC
    LIMIT 1
""")
    TreatmentStep findClosestPreviousStep(Long recordId, int orderIndex);

    Optional<TreatmentStep> findByRecordAndStageOrderIndex(TreatmentRecord record, Integer stageOrderIndex);
}
