package com.pedrohenrique.backend.dto.workspace.sync;

import java.util.UUID;

import jakarta.validation.constraints.NotNull;

public record FolderRequest(
    @NotNull UUID id,
    @NotNull String name,
    UUID parentFolder
) {}
