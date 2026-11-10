package com.pedrohenrique.backend.controller;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.pedrohenrique.backend.dto.workspace.CreateWorkspaceRequest;
import com.pedrohenrique.backend.dto.workspace.CreateWorkspaceResponse;
import com.pedrohenrique.backend.dto.workspace.GetInstancesWithinFolderResponse;
import com.pedrohenrique.backend.dto.workspace.UpdateWorkspaceRequest;
import com.pedrohenrique.backend.dto.workspace.sync.FolderRequest;
import com.pedrohenrique.backend.dto.workspace.sync.WorkspaceSyncRequest;
import com.pedrohenrique.backend.dto.workspace.sync.device.WorkspaceDeviceSyncRequest;
import com.pedrohenrique.backend.dto.workspace.sync.device.WorkspaceDeviceSyncResponse;
import com.pedrohenrique.backend.model.workspace.Workspace;
import com.pedrohenrique.backend.service.workspace.WorkspaceNotificationService;
import com.pedrohenrique.backend.service.workspace.WorkspaceService;
import com.pedrohenrique.backend.service.workspace.dto.GetWorkspaceResponse;
import com.pedrohenrique.backend.service.workspace.dto.WorkspaceContentResponse;
import com.pedrohenrique.backend.service.workspace.dto.WorkspaceSyncResponse;

import jakarta.validation.Valid;


@RestController
@RequestMapping("/workspace")
public class WorkspaceController {
    private final WorkspaceService workspaceService;
    private final WorkspaceNotificationService notificationService;

    public WorkspaceController(WorkspaceService workspaceService, WorkspaceNotificationService workspaceNotificationService) {
        this.workspaceService = workspaceService;
        this.notificationService = workspaceNotificationService;
    }

    private String extractToken(String authHeader) {
        if (authHeader == null)
            return null;
        if (authHeader.startsWith("Bearer "))
            return authHeader.substring(7);
        return authHeader;
    }

    @GetMapping("/syncdevice")
    public ResponseEntity<WorkspaceDeviceSyncResponse> syncDevice(@RequestHeader("Authorization") String authorization, @RequestBody WorkspaceDeviceSyncRequest requestBody) {
        String token = extractToken(authorization);
        WorkspaceDeviceSyncResponse response = workspaceService.syncDevice(token, requestBody.workspaceId(), requestBody.version());
        return ResponseEntity.ok(response);
    }

    @GetMapping(value = "/{workspaceId}/events", produces = "text/event-stream")
    public SseEmitter streamEvents(@PathVariable @Valid UUID workspaceId) {
        return notificationService.initiateConnection(workspaceId);
    }

    @GetMapping("/{id}/structure")
    public ResponseEntity<WorkspaceContentResponse> getFullWorkspaceStructure(
            @RequestHeader("Authorization") String authorization,
            @PathVariable UUID id
        ) {
        String token = extractToken(authorization);
        WorkspaceContentResponse response = workspaceService.getFullWorkspaceContent(token, id);
        return ResponseEntity.ok(response);
    }

    @GetMapping()
    public ResponseEntity<List<GetWorkspaceResponse>> getWorkspaces(@RequestHeader("Authorization") String authorization) {
        String token = extractToken(authorization);
        List<Workspace> workspaces = workspaceService.getWorkspacesByUser(token);
        
        List<GetWorkspaceResponse> response = workspaces.stream().map(w -> GetWorkspaceResponse.builder()
            .workspaceId(w.getId())
            .name(w.getName())
            .version(w.getWorkspaceVersion())
            .build()
        ).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }
    

    @PostMapping
    public ResponseEntity<CreateWorkspaceResponse> createWorkspace(
            @RequestHeader("Authorization") String authorization,
            @RequestBody CreateWorkspaceRequest request) {
        String token = extractToken(authorization);
        CreateWorkspaceResponse response = workspaceService.createWorkspace(token, request);
        return ResponseEntity.ok(response);
    } 

    @PutMapping("/{id}")
    public ResponseEntity<Void> updateWorkspace(
            @RequestHeader("Authorization") String authorization,
            @PathVariable UUID id,
            @RequestBody @Valid UpdateWorkspaceRequest request) {

        String token = extractToken(authorization);
        workspaceService.updateWorkspace(token, id, request);
        return ResponseEntity.noContent().build();
    } 

    @PostMapping("/sync")
    public ResponseEntity<WorkspaceSyncResponse> syncWorkspace(
            @RequestHeader("Authorization") String authorization,
            @Valid @RequestBody WorkspaceSyncRequest request) {
        System.out.println("chego");
        String token = extractToken(authorization);
        WorkspaceSyncResponse response = workspaceService.syncWorkspace(token, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/instances")
    public ResponseEntity<GetInstancesWithinFolderResponse> getInstancesInsideFolder(
            @RequestHeader("Authorization") String authorization,
            @RequestBody FolderRequest folderRequest) {
        String token = extractToken(authorization);
        GetInstancesWithinFolderResponse response = workspaceService.getInstancesInsideFolder(token, folderRequest);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorkspace(
            @RequestHeader("Authorization") String authorization,
            @PathVariable UUID id) {
        String token = extractToken(authorization);
        workspaceService.deleteWorkspace(token, id);
        return ResponseEntity.noContent().build();
    }
}
