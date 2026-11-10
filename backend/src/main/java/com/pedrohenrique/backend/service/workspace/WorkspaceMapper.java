package com.pedrohenrique.backend.service.workspace;

import java.util.List;

import com.pedrohenrique.backend.dto.common.FolderDto;
import com.pedrohenrique.backend.dto.structure.NoteStructureDto;
import com.pedrohenrique.backend.dto.workspace.WorkspaceStructureResponse;
import com.pedrohenrique.backend.model.workspace.Workspace;

public class WorkspaceMapper {
    public static WorkspaceStructureResponse toWorkspaceStructure(Workspace workspace, List<FolderDto> folders, List<NoteStructureDto> notes) {
        return WorkspaceStructureResponse.builder()
            .id(workspace.getId())
            .notes(notes)
            .folders(folders)
            .build();
    }
}