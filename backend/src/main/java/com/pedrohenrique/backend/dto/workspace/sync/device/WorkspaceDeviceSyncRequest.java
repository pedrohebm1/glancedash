package com.pedrohenrique.backend.dto.workspace.sync.device;

import java.util.UUID;

public record WorkspaceDeviceSyncRequest(
    UUID workspaceId,
    int version
) {
    
}
