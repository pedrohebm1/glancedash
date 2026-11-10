package com.pedrohenrique.backend.dto.workspace;

import java.util.List;

import com.pedrohenrique.backend.dto.common.FolderDto;
import com.pedrohenrique.backend.dto.structure.NoteStructureDto;

import lombok.Builder;

@Builder
public record GetInstancesWithinFolderResponse(
    List<FolderDto> folders,
    List<NoteStructureDto> notes
) {}
