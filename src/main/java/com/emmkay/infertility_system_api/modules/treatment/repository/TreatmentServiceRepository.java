package com.emmkay.infertility_system_api.modules.treatment.repository;

import com.emmkay.infertility_system_api.modules.treatment.entity.TreatmentService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TreatmentServiceRepository extends JpaRepository<TreatmentService, Long> {
    boolean existsByName(String name);

    boolean existsByNameAndIdNot(String name, Long id);

    List<TreatmentService> findAllByIsRemoveFalse();

    Optional<TreatmentService> getTreatmentServicesById(Long id);

}
