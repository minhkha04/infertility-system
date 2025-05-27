package com.emmkay.infertility_system_api.repository;

import com.emmkay.infertility_system_api.entity.Doctor;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, String> {

    @EntityGraph(attributePaths = {"users"})
    List<Doctor> findAll();

    @EntityGraph(attributePaths = {"users"})
    Optional<Doctor> findById(String id);
}
