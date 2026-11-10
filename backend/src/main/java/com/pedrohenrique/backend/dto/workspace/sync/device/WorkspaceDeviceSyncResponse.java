package com.pedrohenrique.backend.dto.workspace.sync.device;

import java.util.UUID;

import com.pedrohenrique.backend.dto.common.EntitySyncResponse;

import lombok.Builder;

@Builder
public record WorkspaceDeviceSyncResponse(
    UUID workspaceId,
    int version,
    EntitySyncResponse<NoteResponse> notes,
    EntitySyncResponse<FolderResponse> folders
) {}
