package com.emmkay.infertility_system_api.modules.user.repository;

import com.emmkay.infertility_system_api.modules.admin.projection.AdminUserBasicProjection;
import com.emmkay.infertility_system_api.modules.admin.projection.RoleCountProjection;
import com.emmkay.infertility_system_api.modules.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByUsername(String username);

    boolean existsByUsername(String username);

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByEmailAndIdNot(String email, String id);

    Page<AdminUserBasicProjection> findByIsRemoved(Boolean isRemoved, Pageable pageable);

    @Query(value = """
                SELECT
                            u.roleName.name AS role,
                            COUNT(u) AS count
                FROM User u
                WHERE u.isRemoved = false
                GROUP BY u.roleName.name
            """)
    List<RoleCountProjection> countUserByRoleName();

    long countByIsRemoved(Boolean isRemoved);
}
