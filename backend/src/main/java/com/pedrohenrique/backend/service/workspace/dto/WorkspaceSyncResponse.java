package com.pedrohenrique.backend.service.workspace.dto;

import java.util.UUID;

import lombok.Builder;

@Builder 
public record WorkspaceSyncResponse(UUID id, int version) {
    
}
