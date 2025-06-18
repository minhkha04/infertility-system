package com.emmkay.infertility_system_api.modules.treatment.repository;

import com.emmkay.infertility_system_api.modules.treatment.entity.TreatmentStage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TreatmentStageRepository extends JpaRepository<TreatmentStage, Integer> {
    List<TreatmentStage> findByTypeIdOrderByOrderIndexAsc(Integer typeId);

    boolean existsByName(String name);
}
