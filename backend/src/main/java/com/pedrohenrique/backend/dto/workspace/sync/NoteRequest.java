package com.pedrohenrique.backend.dto.workspace.sync;

import java.util.UUID;

public record NoteRequest(
    UUID id,
    String title,
    String content,
    UUID parentFolder,
    boolean isContentAltered
) {}
