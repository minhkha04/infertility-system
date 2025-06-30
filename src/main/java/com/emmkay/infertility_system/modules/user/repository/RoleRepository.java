package com.emmkay.infertility_system.modules.user.repository;

import com.emmkay.infertility_system.modules.user.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoleRepository extends JpaRepository<Role, String> {
}
