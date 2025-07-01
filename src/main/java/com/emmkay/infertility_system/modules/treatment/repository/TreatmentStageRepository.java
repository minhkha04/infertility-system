package com.emmkay.infertility_system.modules.treatment.repository;

import com.emmkay.infertility_system.modules.treatment.entity.TreatmentStage;
import com.emmkay.infertility_system.modules.treatment.projection.TreatmentStageSelectProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface TreatmentStageRepository extends JpaRepository<TreatmentStage, Long> {


    boolean existsByName(String name);

////    @Query("""
////                SELECT
////                    t.id AS id,
////                    t.name AS name,
////                    t.description AS description,
////                    t.orderIndex AS orderIndex
////                FROM TreatmentStage t
////                WHERE t.type. = :serviceId
////            """)
//    List<TreatmentStageSelectProjection> getTreatmentStageSelect(Long serviceId);

    List<TreatmentStage> findByServiceIdOrderByOrderIndexAsc(Long serviceId);
}
