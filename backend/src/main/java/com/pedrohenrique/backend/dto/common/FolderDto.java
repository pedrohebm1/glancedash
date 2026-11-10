package com.pedrohenrique.backend.dto.common;

import java.util.UUID;

import lombok.Builder;

@Builder
public record FolderDto(
    UUID id,
    String name,
    UUID parentFolderId
) {}