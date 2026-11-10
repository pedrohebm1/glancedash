package com.pedrohenrique.backend.dto.workspace;

import java.util.UUID;

import lombok.Builder;

@Builder
public record UpdateWorkspaceResponse(UUID id, String name) {
    
}
