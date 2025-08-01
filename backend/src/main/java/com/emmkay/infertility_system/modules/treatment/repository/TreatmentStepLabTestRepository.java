package com.emmkay.infertility_system.modules.treatment.repository;

import com.emmkay.infertility_system.modules.treatment.entity.TreatmentStep;
import com.emmkay.infertility_system.modules.treatment.entity.TreatmentStepLabTest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TreatmentStepLabTestRepository extends JpaRepository<TreatmentStepLabTest, Long> {
    List<TreatmentStepLabTest> findAllByTreatmentStep(TreatmentStep treatmentStep);
}
