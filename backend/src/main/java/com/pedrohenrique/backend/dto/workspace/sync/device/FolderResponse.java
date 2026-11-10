package com.pedrohenrique.backend.dto.workspace.sync.device;

import java.util.UUID;

import lombok.Builder;

@Builder
public record FolderResponse(
        UUID id,
        String name,
        UUID parentFolder) {
}
