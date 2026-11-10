package com.pedrohenrique.backend.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.pedrohenrique.backend.model.workspace.Workspace;


import java.util.List;
import com.pedrohenrique.backend.model.user.User;


public interface WorkspaceRepository extends JpaRepository<Workspace, UUID> {
    Optional<Workspace> getWorkspaceById(UUID id);
    Optional<List<Workspace>> findByUsers(List<User> users);
@Query("UPDATE Workspace SET workspaceVersion = :newVersion WHERE id = :id")
int updateVersion(@Param("id") UUID id, @Param("newVersion") int newVersion);

}
