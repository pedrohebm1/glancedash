package com.pedrohenrique.backend.dto.workspace;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateWorkspaceRequest(@NotNull @Size(max = 30) String name) {}
