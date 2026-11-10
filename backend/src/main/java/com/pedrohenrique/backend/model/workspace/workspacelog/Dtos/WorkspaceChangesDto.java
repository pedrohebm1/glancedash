package com.pedrohenrique.backend.model.workspace.workspacelog.Dtos;

import java.util.List;
import java.util.UUID;

import lombok.Builder;

@Builder
public record WorkspaceChangesDto(List<UUID> createdNotes,
        List<UUID> updatedNotes,
        List<UUID> deletedNotes,

        List<UUID> createdFolders,
        List<UUID> updatedFolders,
        List<UUID> deletedFolders) {
}
