package com.pedrohenrique.backend.dto.workspace;

import java.util.UUID;

import lombok.Builder;

@Builder
public record CreateWorkspaceResponse(UUID id, String name, int version) {
    
}
