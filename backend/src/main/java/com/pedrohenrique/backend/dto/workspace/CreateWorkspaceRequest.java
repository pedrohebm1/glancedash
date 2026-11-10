package com.pedrohenrique.backend.dto.workspace;

import java.util.UUID;

import jakarta.annotation.Nonnull;
import jakarta.validation.constraints.Size;

public record CreateWorkspaceRequest(
    @Nonnull UUID workspaceId,
    @Nonnull @Size(max = 30) String name
) {}