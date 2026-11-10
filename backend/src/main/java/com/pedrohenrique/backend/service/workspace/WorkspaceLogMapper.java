package com.pedrohenrique.backend.service.workspace;

import java.util.List;
import java.util.UUID;
import java.util.function.Function;

import com.pedrohenrique.backend.dto.workspace.sync.FolderRequest;
import com.pedrohenrique.backend.dto.workspace.sync.NoteRequest;
import com.pedrohenrique.backend.dto.workspace.sync.WorkspaceSyncRequest;
import com.pedrohenrique.backend.model.workspace.workspacelog.Dtos.WorkspaceChangesDto;

public class WorkspaceLogMapper {
    private static <T> List<UUID> mapIds(List<T> list, Function<T, UUID> mapper) {
        return list == null ? List.of() : list.stream().map(mapper).toList();
    }

    private static List<UUID> ids(List<UUID> list) {
        return list == null ? List.of() : list;
    }

    public static WorkspaceChangesDto changesMapper(WorkspaceSyncRequest request) {
        WorkspaceChangesDto dto = WorkspaceChangesDto.builder()
        .createdFolders(mapIds(request.folders() != null ? request.folders().created() : null, FolderRequest::id))
        .updatedFolders(mapIds(request.folders() != null ? request.folders().updated() : null, FolderRequest::id))
        .deletedFolders(ids(request.folders() != null ? request.folders().deleted() : null))
        .createdNotes(mapIds(request.notes() != null ? request.notes().created() : null, NoteRequest::id))
        .updatedNotes(mapIds(request.notes() != null ? request.notes().updated() : null, NoteRequest::id))
        .deletedNotes(ids(request.notes() != null ? request.notes().deleted() : null))
        .build();

        return dto;
    }
}
