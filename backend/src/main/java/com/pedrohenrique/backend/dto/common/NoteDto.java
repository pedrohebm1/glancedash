package com.pedrohenrique.backend.dto.common;

import java.util.UUID;

import lombok.Builder;

@Builder
public record NoteDto(
    UUID id,
    String title,
    String content,
    UUID parentFolderId
) {}