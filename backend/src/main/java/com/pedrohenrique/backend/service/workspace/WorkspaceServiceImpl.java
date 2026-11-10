package com.pedrohenrique.backend.service.workspace;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

import com.pedrohenrique.backend.dto.common.EntitySyncResponse;
import com.pedrohenrique.backend.dto.workspace.CreateWorkspaceRequest;
import com.pedrohenrique.backend.dto.workspace.CreateWorkspaceResponse;
import com.pedrohenrique.backend.dto.workspace.GetInstancesWithinFolderResponse;
import com.pedrohenrique.backend.dto.workspace.UpdateWorkspaceRequest;
import com.pedrohenrique.backend.dto.workspace.sync.FolderRequest;
import com.pedrohenrique.backend.dto.workspace.sync.WorkspaceSyncRequest;
import com.pedrohenrique.backend.dto.workspace.sync.device.FolderResponse;
import com.pedrohenrique.backend.dto.workspace.sync.device.NoteResponse;
import com.pedrohenrique.backend.dto.workspace.sync.device.WorkspaceDeviceSyncResponse;
import com.pedrohenrique.backend.exceptions.WorkspaceVersionConflictException;
import com.pedrohenrique.backend.model.folder.Folder;
import com.pedrohenrique.backend.model.note.Note;
import com.pedrohenrique.backend.model.user.User;
import com.pedrohenrique.backend.model.workspace.Workspace;
import com.pedrohenrique.backend.model.workspace.workspacelog.WorkspaceLog;
import com.pedrohenrique.backend.repository.FolderRepository;
import com.pedrohenrique.backend.repository.NoteRepository;
import com.pedrohenrique.backend.repository.UserRepository;
import com.pedrohenrique.backend.repository.WorkspaceLogRepository;
import com.pedrohenrique.backend.repository.WorkspaceRepository;
import com.pedrohenrique.backend.service.auth.AuthenticationService;
import com.pedrohenrique.backend.service.auth.JwtService;
import com.pedrohenrique.backend.service.workspace.dto.WorkspaceContentResponse;
import com.pedrohenrique.backend.service.workspace.dto.WorkspaceSyncResponse;
import com.pedrohenrique.backend.service.workspace.folder.FolderMapper;
import com.pedrohenrique.backend.service.workspace.folder.FolderService;
import com.pedrohenrique.backend.service.workspace.note.NoteMapper;
import com.pedrohenrique.backend.service.workspace.note.NoteService;

import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.PersistenceContext;

import org.springframework.transaction.annotation.Transactional;

@Service
public class WorkspaceServiceImpl implements WorkspaceService {

    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceLogRepository workspaceLogRepository;
    private final FolderRepository folderRepository;
    private final NoteRepository noteRepository;
    private final FolderService folderService;
    private final NoteService noteService;
    private final AuthenticationService authenticationService;
    @PersistenceContext
    private final EntityManager entityManager;

    public WorkspaceServiceImpl(WorkspaceRepository workspaceRepository,
            JwtService jwtService, UserRepository userRepository, FolderRepository folderRepository,
            NoteRepository noteRepository, FolderService folderService, NoteService noteService,
            AuthenticationService authenticationService, WorkspaceLogRepository workspaceLogRepository,
            WorkspaceNotificationService workspaceNotificationService, EntityManager entityManager) {
        this.workspaceRepository = workspaceRepository;
        this.folderRepository = folderRepository;
        this.noteRepository = noteRepository;
        this.folderService = folderService;
        this.noteService = noteService;
        this.authenticationService = authenticationService;
        this.workspaceLogRepository = workspaceLogRepository;
        this.entityManager = entityManager;
    }

    @Override
    @Transactional
    public CreateWorkspaceResponse createWorkspace(String token, @Validated CreateWorkspaceRequest request) {
        User user = authenticationService.findUserByToken(token);

        Workspace workspace = workspaceRepository.save(Workspace.builder()
                .id(request.workspaceId())
                .name(request.name())
                .users(List.of(user))
                .workspaceVersion(1)
                .updatedAt(Instant.now())
                .build());

        return CreateWorkspaceResponse.builder()
                .id(workspace.getId())
                .name(workspace.getName())
                .version(workspace.getWorkspaceVersion())
                .build();
    }

    @Override
    public List<Workspace> getWorkspacesByUser(String token) {
        User user = authenticationService.findUserByToken(token);

        List<Workspace> workspaces = workspaceRepository.findByUsers(List.of(user))
                .orElseThrow(() -> new EntityNotFoundException(""));

        return workspaces;
    }

    @Override
    public void updateWorkspace(String token, UUID id, @Validated UpdateWorkspaceRequest request) {
        User user = authenticationService.findUserByToken(token);

        Workspace workspace = workspaceRepository.getWorkspaceById(id)
                .orElseThrow(() -> new EntityNotFoundException("Workspace not found"));

        if (!workspace.getUsers().contains(user))
            throw new AccessDeniedException("The user does not belong to that workspace");

        workspace.setName(request.name());
        workspace.setUpdatedAt(Instant.now());

        workspaceRepository.save(workspace);
    }

    @Override
    public WorkspaceContentResponse getFullWorkspaceContent(String token, UUID id) {
        User user = authenticationService.findUserByToken(token);

        Workspace workspace = workspaceRepository.getWorkspaceById(id)
                .orElseThrow(() -> new EntityNotFoundException("Workspace not found"));

        if (!workspace.getUsers().contains(user))
            throw new AccessDeniedException("The user does not belong to that workspace");

        List<NoteResponse> notes = new ArrayList<>();
        List<FolderResponse> folders = new ArrayList<>();

        if (workspace.getFolders() != null && !workspace.getFolders().isEmpty()) {
            for (Folder folder : workspace.getFolders()) {
                folders.add(FolderResponse.builder()
                        .id(folder.getId())
                        .name(folder.getName())
                        .parentFolder(folder.getParentFolder() != null ? folder.getParentFolder().getId() : null)
                        .build());
            }
        }

        if (workspace.getNotes() != null && !workspace.getNotes().isEmpty()) {
            for (Note note : workspace.getNotes()) {
                notes.add(NoteResponse.builder()
                        .id(note.getId())
                        .title(note.getTitle())
                        .content(note.getContent())
                        .parentFolder(note.getFolder() != null ? note.getFolder().getId() : null)
                        .build());
            }
        }

        return WorkspaceContentResponse.builder()
                .workspaceId(workspace.getId())
                .notes(notes)
                .folders(folders)
                .version(workspace.getWorkspaceVersion())
                .build();
    }

    @Override
    public WorkspaceDeviceSyncResponse syncDevice(String token, UUID workspaceId, int version) {
        User user = authenticationService.findUserByToken(token);

        Workspace workspace = workspaceRepository.getWorkspaceById(workspaceId)
                .orElseThrow(() -> new EntityNotFoundException("Workspace not found"));

        if (!workspace.getUsers().contains(user)) {
            throw new AccessDeniedException("The user does not belong to that workspace");
        }

        if (version == workspace.getWorkspaceVersion()) {
            return buildEmptySyncResponse(workspace);
        }

        List<WorkspaceLog> logs = workspaceLogRepository.findAllByBetweenVersions(version,
                workspace.getWorkspaceVersion());

        Set<UUID> foldersToDelete = new HashSet<>();
        Set<UUID> foldersToCreate = new HashSet<>();
        Set<UUID> foldersToUpdate = new HashSet<>();

        Set<UUID> notesToDelete = new HashSet<>();
        Set<UUID> notesToCreate = new HashSet<>();
        Set<UUID> notesToUpdate = new HashSet<>();

        for (WorkspaceLog log : logs) {
            var changes = log.getChanges();

            foldersToDelete.addAll(changes.deletedFolders());
            notesToDelete.addAll(changes.deletedNotes());

            changes.createdFolders().stream()
                    .filter(id -> !foldersToDelete.contains(id))
                    .forEach(foldersToCreate::add);

            changes.updatedFolders().stream()
                    .filter(id -> !foldersToDelete.contains(id) && !foldersToCreate.contains(id))
                    .forEach(foldersToUpdate::add);

            changes.createdNotes().stream()
                    .filter(id -> !notesToDelete.contains(id))
                    .forEach(notesToCreate::add);

            changes.updatedNotes().stream()
                    .filter(id -> !notesToDelete.contains(id) && !notesToCreate.contains(id))
                    .forEach(notesToUpdate::add);
        }

        Set<UUID> notesToFetch = new HashSet<>(notesToCreate);
        notesToFetch.addAll(notesToUpdate);

        Set<UUID> foldersToFetch = new HashSet<>(foldersToCreate);
        foldersToFetch.addAll(foldersToUpdate);

        List<Note> notesFromDatabase = noteRepository.findAllById(notesToFetch);
        List<Folder> foldersFromDatabase = folderRepository.findAllById(foldersToFetch);

        EntitySyncResponse<NoteResponse> notesResponse = EntitySyncResponse.<NoteResponse>builder()
                .created(notesFromDatabase.stream()
                        .filter(n -> notesToCreate.contains(n.getId()))
                        .map(this::mapToNoteResponse)
                        .toList())
                .updated(notesFromDatabase.stream()
                        .filter(n -> notesToUpdate.contains(n.getId()))
                        .map(this::mapToNoteResponse)
                        .toList())
                .deleted(new ArrayList<>(notesToDelete))
                .build();

        EntitySyncResponse<FolderResponse> foldersResponse = EntitySyncResponse.<FolderResponse>builder()
                .created(foldersFromDatabase.stream()
                        .filter(f -> foldersToCreate.contains(f.getId()))
                        .map(this::mapToFolderResponse)
                        .toList())
                .updated(foldersFromDatabase.stream()
                        .filter(f -> foldersToUpdate.contains(f.getId()))
                        .map(this::mapToFolderResponse)
                        .toList())
                .deleted(new ArrayList<>(foldersToDelete))
                .build();

        return WorkspaceDeviceSyncResponse.builder()
                .workspaceId(workspace.getId())
                .notes(notesResponse)
                .folders(foldersResponse)
                .version(workspace.getWorkspaceVersion())
                .build();
    }

    @Override
    public GetInstancesWithinFolderResponse getInstancesInsideFolder(String token,
            @Validated FolderRequest folderRequest) {
        User user = authenticationService.findUserByToken(token);

        Folder folder = folderRepository.findById(folderRequest.id())
                .orElseThrow(() -> new EntityNotFoundException("Entity not found"));

        UUID workspaceId = folder.getWorkspace().getId();

        Workspace workspace = workspaceRepository.getWorkspaceById(workspaceId)
                .orElseThrow(() -> new EntityNotFoundException("Workspace not found"));

        if (!workspace.getUsers().contains(user))
            throw new AccessDeniedException("Workspace does not belong to that user");

        List<Folder> foldersWithinParentFolder = folderRepository
                .findAllByWorkspaceIdAndParentFolderId(workspaceId, folderRequest.parentFolder())
                .orElse(Collections.emptyList());

        List<Note> notesWithinParentFolder = noteRepository
                .findAllByWorkspaceIdAndParentFolderId(workspaceId, folderRequest.parentFolder())
                .orElse(Collections.emptyList());

        return GetInstancesWithinFolderResponse.builder()
                .folders(FolderMapper.toFolderStructure(foldersWithinParentFolder))
                .notes(NoteMapper.toNoteStructure(notesWithinParentFolder))
                .build();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public WorkspaceSyncResponse syncWorkspace(String token, WorkspaceSyncRequest request) {
        User user = authenticationService.findUserByToken(token);

        Workspace workspace = workspaceRepository.getWorkspaceById(request.workspaceId())
                .orElseThrow(() -> new EntityNotFoundException("Workspace não encontrado"));

        if (!workspace.getUsers().contains(user)) {
            throw new AccessDeniedException("O usuário não pertence a este workspace");
        }

        if (request.version() != workspace.getWorkspaceVersion()) {
            throw new WorkspaceVersionConflictException(request.version(), workspace.getWorkspaceVersion());
        }

        if (request == null || request.isSyncEmpty())
            throw new IllegalArgumentException(
                    "The sync payload is empty. At least one change (create, update, or delete) must be provided.");
        
        
        if (hasDeletedNotes(request)) {
            noteRepository.deleteAllById(noteService.deleteNotes(request.notes().deleted(), workspace));
        }

        if (hasDeletedFolders(request)) {
            folderRepository.deleteAllById(folderService.deleteFolders(request.folders().deleted(), workspace));
        }

        if (request.folders() != null) {
            List<Folder> foldersToSave = new ArrayList<>();
            if (hasCreatedFolders(request)) {
                foldersToSave.addAll(folderService.createFolders(request.folders().created(), workspace));
            }
            if (hasUpdatedFolders(request)) {
                foldersToSave.addAll(folderService.updateFolders(request.folders().updated(), workspace));
            }
            folderRepository.saveAll(foldersToSave);
        }

        if (request.notes() != null) {
            List<Note> notesToSave = new ArrayList<>();
            if (hasCreatedNotes(request)) {
                notesToSave.addAll(noteService.createNotes(request.notes().created(), workspace));
            }
            if (hasUpdatedNotes(request)) {
                notesToSave.addAll(noteService.updateNotes(request.notes().updated(), workspace));
            }
            noteRepository.saveAll(notesToSave);
        }

        WorkspaceLog log = WorkspaceLog.builder()
                .changes(WorkspaceLogMapper.changesMapper(request))
                .version(workspace.getWorkspaceVersion())
                .workspace(workspace)
                .build();

        workspaceLogRepository.save(log);
        workspace.setUpdatedAt(Instant.now());
        workspace.setWorkspaceVersion(workspace.getWorkspaceVersion()+1);

        return WorkspaceSyncResponse.builder()
                .id(workspace.getId())
                .version(workspace.getWorkspaceVersion())
                .build();   
    }

    private boolean hasDeletedNotes(WorkspaceSyncRequest req) {
        return req.notes() != null && req.notes().deleted() != null && !req.notes().deleted().isEmpty();
    }

    private boolean hasDeletedFolders(WorkspaceSyncRequest req) {
        return req.folders() != null && req.folders().deleted() != null && !req.folders().deleted().isEmpty();
    }

    private boolean hasCreatedFolders(WorkspaceSyncRequest req) {
        return req.folders() != null && req.folders().created() != null && !req.folders().created().isEmpty();
    }

    private boolean hasUpdatedFolders(WorkspaceSyncRequest req) {
        return req.folders() != null && req.folders().updated() != null && !req.folders().updated().isEmpty();
    }

    private boolean hasCreatedNotes(WorkspaceSyncRequest req) {
        return req.notes() != null && req.notes().created() != null && !req.notes().created().isEmpty();
    }

    private boolean hasUpdatedNotes(WorkspaceSyncRequest req) {
        return req.notes() != null && req.notes().updated() != null && !req.notes().updated().isEmpty();
    }

    @Override
    public void deleteWorkspace(String token, UUID workspaceId) {
        if (workspaceId == null)
            throw new IllegalArgumentException("Workspace id missing");
        User user = authenticationService.findUserByToken(token);

        Workspace workspace = workspaceRepository.getWorkspaceById(workspaceId)
                .orElseThrow(() -> new EntityNotFoundException("Workspace not found"));

        if (!workspace.getUsers().contains(user))
            throw new AccessDeniedException("The user does not belong to that workspace");

        workspaceRepository.deleteById(workspaceId);
    }

    private NoteResponse mapToNoteResponse(Note note) {
        UUID parentFolderId = note.getFolder() != null ? note.getFolder().getId() : null;
        return NoteResponse.builder()
                .id(note.getId())
                .title(note.getTitle())
                .content(note.getContent())
                .parentFolder(parentFolderId)
                .build();
    }

    private FolderResponse mapToFolderResponse(Folder folder) {
        UUID parentFolderId = folder.getParentFolder() != null ? folder.getParentFolder().getId() : null;
        return FolderResponse.builder()
                .id(folder.getId())
                .name(folder.getName())
                .parentFolder(parentFolderId)
                .build();
    }

    private WorkspaceDeviceSyncResponse buildEmptySyncResponse(Workspace workspace) {
        return WorkspaceDeviceSyncResponse.builder()
                .workspaceId(workspace.getId())
                .version(workspace.getWorkspaceVersion())
                .notes(EntitySyncResponse.<NoteResponse>builder()
                        .created(List.of()).updated(List.of()).deleted(List.of()).build())
                .folders(EntitySyncResponse.<FolderResponse>builder()
                        .created(List.of()).updated(List.of()).deleted(List.of()).build())
                .build();
    }
}