package com.pedrohenrique.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pedrohenrique.backend.model.user.role.Role;
import com.pedrohenrique.backend.model.user.role.RoleName;

public interface RoleRepository extends JpaRepository<Role, Integer> {
    Optional<Role> findByName(RoleName name);
}
