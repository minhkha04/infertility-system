package com.emmkay.infertility_system_api.repository;

import com.emmkay.infertility_system_api.entity.Role;
import com.emmkay.infertility_system_api.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByUsername(String username);

    boolean existsByUsername(String username);

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findAllByIsRemovedFalse();

    List<User> findAllByIsRemovedFalseAndRoleName(Role roleName);

    List<User> findAllByIsRemovedTrue();

    List<User> findAllByIsRemovedTrueAndRoleName(Role roleName);

    Optional<Object> findByIdAndIsRemovedTrue(String userId);
}
