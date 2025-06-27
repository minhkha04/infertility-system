package com.emmkay.infertility_system_api.modules.treatment.repository;

import com.emmkay.infertility_system_api.modules.treatment.entity.TreatmentService;
import com.emmkay.infertility_system_api.modules.treatment.projection.PublicServiceProjection;
import com.emmkay.infertility_system_api.modules.treatment.projection.TreatmentServiceBasicProjection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TreatmentServiceRepository extends JpaRepository<TreatmentService, Long> {
    boolean existsByName(String name);

    boolean existsByNameAndIdNot(String name, Long id);

    Optional<TreatmentService> getTreatmentServicesById(Long id);

    @Query("""
                SELECT
                    t.id AS id,
                    t.name AS name,
                    t.price AS price,
                    t.duration AS duration,
                    t.isRemove AS isRemove,
                    t.coverImageUrl AS coverImageUrl,
                    t.description AS description
                FROM TreatmentService t
                WHERE (:name IS NULL OR t.name LIKE CONCAT('%', :name, '%'))
                    AND (:isRemove IS NULL OR t.isRemove = :isRemove)
            """)
    Page<TreatmentServiceBasicProjection> searchTreatmentServices(String name, Boolean isRemove, Pageable pageable);

    @Query("""
                SELECT
                    t.id AS serviceId,
                    t.name AS serviceName,
                    t.coverImageUrl AS coverImageUrl,
                    t.price AS price,
                    t.type.name AS typeName,
                    t.type.description AS description,
                    t.type.id AS typeId,
                    t.duration AS duration
                FROM TreatmentService t
                WHERE t.id = :id
            """)
    PublicServiceProjection getPublicServiceById(Long id);


}
