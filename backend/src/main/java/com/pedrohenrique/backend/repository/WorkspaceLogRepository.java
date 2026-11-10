package com.pedrohenrique.backend.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.pedrohenrique.backend.model.workspace.workspacelog.WorkspaceLog;

public interface WorkspaceLogRepository extends JpaRepository<WorkspaceLog, UUID>{
    @Query("SELECT l FROM WorkspaceLog l WHERE l.version >= :startVersion AND l.version <= :endVersion")
    List<WorkspaceLog> findAllByBetweenVersions(
        @Param("startVersion") int startVersion,
        @Param("endVersion") int endVersion
    );
}
