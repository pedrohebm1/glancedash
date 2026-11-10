package com.pedrohenrique.backend.service.workspace.dto;

import java.util.List;
import java.util.UUID;

import com.pedrohenrique.backend.dto.workspace.sync.device.FolderResponse;
import com.pedrohenrique.backend.dto.workspace.sync.device.NoteResponse;

import lombok.Builder;

@Builder
public record WorkspaceContentResponse(UUID workspaceId,
    int version,
    List<NoteResponse> notes,
    List<FolderResponse> folders) {
    
}
