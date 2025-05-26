package com.emmkay.infertility_system_api.repository;

import com.emmkay.infertility_system_api.entity.TreatmentStage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TreatmentStageRepository extends JpaRepository<TreatmentStage, Integer> {
    List<TreatmentStage> findByTypeIdOrderByOrderIndexAsc(Integer typeId);

    boolean existsByNameAndTypeId(String name, Integer typeId);

    boolean existsByNameAndTypeIdAndOrderIndex(String name, Integer typeId, Integer orderIndex);

    boolean existsByNameAndTypeIdAndOrderIndexAndDescription(String name, Integer typeId, Integer orderIndex, String description);
}
