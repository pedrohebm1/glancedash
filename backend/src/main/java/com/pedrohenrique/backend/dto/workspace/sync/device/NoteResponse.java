package com.pedrohenrique.backend.dto.workspace.sync.device;

import java.util.UUID;

import lombok.Builder;

@Builder
public record NoteResponse(UUID id,
        String title,
        String content,
        UUID parentFolder) {

}
