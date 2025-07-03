package com.emmkay.infertility_system.modules.treatment.repository;

import com.emmkay.infertility_system.modules.treatment.entity.TreatmentStage;
import com.emmkay.infertility_system.modules.treatment.projection.TreatmentStageSelectProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TreatmentStageRepository extends JpaRepository<TreatmentStage, Long> {


    boolean existsByName(String name);

    @Query("""
                SELECT
                    t.id AS id,
                    t.name AS name,
                    t.description AS description,
                    t.orderIndex AS orderIndex
                FROM TreatmentStage t
                WHERE t.service.id = :serviceId
                    AND t.orderIndex != 0
                ORDER BY t.orderIndex ASC
            """)
    List<TreatmentStageSelectProjection> getTreatmentStageSelect(Long serviceId);

    List<TreatmentStage> findByServiceIdOrderByOrderIndexAsc(Long serviceId);

    Optional<TreatmentStage> findByOrderIndexAndServiceId(Integer orderIndex, Long serviceId);
}
