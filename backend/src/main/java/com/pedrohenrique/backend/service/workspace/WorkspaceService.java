package com.pedrohenrique.backend.service.workspace;

import java.util.List;
import java.util.UUID;

import org.jspecify.annotations.Nullable;

import com.pedrohenrique.backend.dto.workspace.CreateWorkspaceRequest;
import com.pedrohenrique.backend.dto.workspace.CreateWorkspaceResponse;
import com.pedrohenrique.backend.dto.workspace.UpdateWorkspaceRequest;
import com.pedrohenrique.backend.dto.workspace.GetInstancesWithinFolderResponse;
import com.pedrohenrique.backend.dto.workspace.sync.FolderRequest;
import com.pedrohenrique.backend.dto.workspace.sync.WorkspaceSyncRequest;
import com.pedrohenrique.backend.dto.workspace.sync.device.WorkspaceDeviceSyncResponse;
import com.pedrohenrique.backend.model.workspace.Workspace;
import com.pedrohenrique.backend.service.workspace.dto.WorkspaceContentResponse;
import com.pedrohenrique.backend.service.workspace.dto.WorkspaceSyncResponse;

public interface WorkspaceService {
    CreateWorkspaceResponse createWorkspace(String token, CreateWorkspaceRequest request);
    void updateWorkspace(String token, UUID id, UpdateWorkspaceRequest request);
    void deleteWorkspace(String token, UUID workspaceId);
    GetInstancesWithinFolderResponse getInstancesInsideFolder(String token, FolderRequest folderRequest);
    WorkspaceContentResponse getFullWorkspaceContent(String token, UUID id);
    WorkspaceSyncResponse syncWorkspace(String token, WorkspaceSyncRequest request);
    WorkspaceDeviceSyncResponse syncDevice(String token, UUID workspaceId, int version);
    @Nullable
    List<Workspace> getWorkspacesByUser(String token);
}
