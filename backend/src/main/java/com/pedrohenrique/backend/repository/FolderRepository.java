package com.pedrohenrique.backend.repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.pedrohenrique.backend.model.folder.Folder;

public interface FolderRepository extends JpaRepository<Folder, UUID> {
    Optional<List<Folder>> findAllByIdIn(List<UUID> ids);
    @Query("SELECT f FROM Folder f JOIN f.workspace WHERE f.id IN :ids AND f.workspace.id = :workspaceId")
    Optional<List<Folder>> findAllByWorkspaceIdAndIds(
        UUID workspaceId,
        Set<UUID> ids);
    @Query("SELECT f FROM Folder f WHERE f.workspace.id = :workspaceId AND f.parentFolder.id = :parentFolderId")
    Optional<List<Folder>> findAllByWorkspaceIdAndParentFolderId(UUID workspaceId, UUID parentFolderId);
}
