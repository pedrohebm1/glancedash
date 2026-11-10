package com.pedrohenrique.backend.dto.workspace.sync;

import java.util.UUID;

import com.pedrohenrique.backend.dto.common.EntitySyncRequest;

import jakarta.validation.constraints.NotNull;

public record WorkspaceSyncRequest(
    @NotNull(message = "WorkspaceId is required") 
    UUID workspaceId,

    @NotNull(message = "Version is required") 
    Integer version,
    
    EntitySyncRequest<NoteRequest> notes,

    EntitySyncRequest<FolderRequest> folders
) {
    public boolean isSyncEmpty() {
        boolean isNotesEmpty = notes == null || notes.isEmpty();
        boolean isFoldersEmpty = folders == null || folders.isEmpty();

        return isNotesEmpty && isFoldersEmpty;
    }
}