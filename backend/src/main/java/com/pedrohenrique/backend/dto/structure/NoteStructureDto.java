package com.pedrohenrique.backend.dto.structure;

import java.util.UUID;

import lombok.Builder;

@Builder
public record NoteStructureDto(
    UUID id,
    String title,
    UUID parentFolderId
) {
}
