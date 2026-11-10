package com.pedrohenrique.backend.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.pedrohenrique.backend.model.note.Note;

public interface NoteRepository extends JpaRepository<Note, UUID> {
    @Query("SELECT n FROM Note n WHERE n.workspace.id = :workspaceId AND n.folder.id = :parentFolderId")
    Optional<List<Note>> findAllByWorkspaceIdAndParentFolderId(
            @Param("workspaceId") UUID workspaceId,
            @Param("parentFolderId") UUID parentFolderId);
}
