package com.emmkay.infertility_system_api.modules.treatment.repository;

import com.emmkay.infertility_system_api.modules.treatment.entity.TreatmentStage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TreatmentStageRepository extends JpaRepository<TreatmentStage, Long> {
    List<TreatmentStage> findByTypeIdOrderByOrderIndexAsc(Long typeId);

    boolean existsByName(String name);
}
