package com.pedrohenrique.backend.service.workspace.dto;

import java.util.UUID;

import lombok.Builder;

@Builder 
public record GetWorkspaceResponse(UUID workspaceId, String name, int version) {
    
}
