package com.pedrohenrique.backend.dto.workspace;

import java.util.List;
import java.util.UUID;

import com.pedrohenrique.backend.dto.common.FolderDto;
import com.pedrohenrique.backend.dto.structure.NoteStructureDto;

import lombok.Builder;

@Builder
public record WorkspaceStructureResponse(
    UUID id,
    List<NoteStructureDto> notes,
    List<FolderDto> folders
) {
    
}
