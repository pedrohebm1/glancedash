package com.pedrohenrique.backend.service.workspace.folder;

import java.util.List;

import com.pedrohenrique.backend.dto.common.FolderDto;
import com.pedrohenrique.backend.model.folder.Folder;

public class FolderMapper {
    public static List<FolderDto> toFolderStructure(List<Folder> folder) {
        return folder.stream().map(f -> FolderDto.builder()
            .id(f.getId())
            .name(f.getName())
            .parentFolderId(f.getParentFolder().getId())
            .build()).toList();
    }
}
