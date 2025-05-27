package com.emmkay.infertility_system_api.repository;

import com.emmkay.infertility_system_api.entity.TreatmentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


import java.util.List;

@Repository
public interface TreatmentTypeRepository extends JpaRepository<TreatmentType, Integer> {
    boolean existsByName(String name);

    List<TreatmentType> findByNameContainingIgnoreCase(String name);
}
