package com.pedrohenrique.backend.service.workspace.folder;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Objects;

import org.springframework.stereotype.Component;
import com.pedrohenrique.backend.dto.workspace.sync.FolderRequest;
import com.pedrohenrique.backend.model.folder.Folder;
import com.pedrohenrique.backend.model.workspace.Workspace;
import com.pedrohenrique.backend.repository.FolderRepository;

import jakarta.persistence.EntityNotFoundException;

@Component
public class FolderService {

    private final FolderRepository folderRepository;

    public FolderService(FolderRepository folderRepository) {
        this.folderRepository = folderRepository;
    }

    public List<Folder> createFolders(List<FolderRequest> folderRequests, Workspace workspace) {
        Instant now = Instant.now();

        Set<UUID> parentFolderIds = folderRequests.stream()
                .map(FolderRequest::parentFolder)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<UUID, Folder> parentsInDatabase = Collections.emptyMap();
        if (!parentFolderIds.isEmpty()) {
            parentsInDatabase = folderRepository
                    .findAllByWorkspaceIdAndIds(workspace.getId(), parentFolderIds)
                    .orElse(Collections.emptyList())
                    .stream()
                    .collect(Collectors.toMap(Folder::getId, Function.identity()));
        }

        Map<UUID, Folder> newlyCreatedFolders = new HashMap<>();
        List<Folder> foldersToSave = new ArrayList<>();

        for (FolderRequest request : folderRequests) {
            Folder parent = request.parentFolder() == null ? null : parentsInDatabase.get(request.parentFolder());
            if (parent == null && request.parentFolder() != null) {
                parent = newlyCreatedFolders.get(request.parentFolder());
            }

            Folder newFolder = Folder.builder()
                    .id(request.id())
                    .name(request.name())
                    .parentFolder(parent)
                    .workspace(workspace)
                    .updatedAt(now)
                    .build();

            newlyCreatedFolders.put(newFolder.getId(), newFolder);
            foldersToSave.add(newFolder);
        }

        return foldersToSave;
    }

    public List<Folder> updateFolders(List<FolderRequest> folderRequests, Workspace workspace) {
        Instant now = Instant.now();

        Set<UUID> folderIds = folderRequests.stream().map(FolderRequest::id).collect(Collectors.toSet());
        Set<UUID> parentFolderIds = folderRequests.stream()
                .map(FolderRequest::parentFolder)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<UUID, Folder> existingFolders = folderRepository.findAllById(folderIds)
                .stream()
                .collect(Collectors.toMap(Folder::getId, Function.identity()));

        Map<UUID, Folder> parentFolders = Collections.emptyMap();
        if (!parentFolderIds.isEmpty()) {
            parentFolders = folderRepository.findAllByWorkspaceIdAndIds(workspace.getId(), parentFolderIds)
                    .orElse(Collections.emptyList())
                    .stream()
                    .collect(Collectors.toMap(Folder::getId, Function.identity()));
        }

        List<Folder> foldersToSave = new ArrayList<>();

        for (FolderRequest request : folderRequests) {
            Folder existingFolder = existingFolders.get(request.id());
            if (existingFolder == null) {
                continue;
            }

            Folder parent = request.parentFolder() == null ? null : parentFolders.get(request.parentFolder());

            existingFolder.setName(request.name());
            existingFolder.setParentFolder(parent);
            existingFolder.setUpdatedAt(now);

            foldersToSave.add(existingFolder);
        }

        return foldersToSave;
    }

    public List<UUID> deleteFolders(List<UUID> ids, Workspace workspace) {
        List<Folder> foldersToBeDeleted = folderRepository.findAllById(ids);

        if (foldersToBeDeleted.isEmpty()) {
            throw new EntityNotFoundException("No folder found to delete");
        }

        List<UUID> validatedFolders = foldersToBeDeleted.stream()
                .filter(f -> f.getWorkspace() != null && workspace.getId().equals(f.getWorkspace().getId()))
                .map(Folder::getId)
                .collect(Collectors.toList());

        if (validatedFolders.size() != foldersToBeDeleted.size()) {
            throw new IllegalArgumentException("Target folders size mismatch or unauthorized deletion attempt.");
        }

        return validatedFolders;
    }
}