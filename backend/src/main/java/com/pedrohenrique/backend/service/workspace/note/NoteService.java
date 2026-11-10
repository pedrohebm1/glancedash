package com.pedrohenrique.backend.service.workspace.note;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;
import com.pedrohenrique.backend.dto.workspace.sync.NoteRequest;
import com.pedrohenrique.backend.model.folder.Folder;
import com.pedrohenrique.backend.model.note.Note;
import com.pedrohenrique.backend.model.workspace.Workspace;
import com.pedrohenrique.backend.repository.FolderRepository;
import com.pedrohenrique.backend.repository.NoteRepository;

import jakarta.persistence.EntityNotFoundException;

@Component
public class NoteService {
    private final FolderRepository folderRepository;
    private final NoteRepository noteRepository;

    public NoteService(NoteRepository noteRepository, FolderRepository folderRepository) {
        this.folderRepository = folderRepository;
        this.noteRepository = noteRepository;
    }

    public List<Note> createNotes(List<NoteRequest> noteRequest, Workspace workspace) {
        Set<Note> processingNotes = new HashSet<>();
        Instant now = Instant.now();

        Set<UUID> folderParentIds = noteRequest.stream()
                .map(NoteRequest::parentFolder)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<UUID, Folder> foldersInDatabase = Collections.emptyMap();
        if (!folderParentIds.isEmpty()) {
            foldersInDatabase = folderRepository
                    .findAllByWorkspaceIdAndIds(workspace.getId(), folderParentIds)
                    .orElseThrow(() -> new EntityNotFoundException("Parent folders not found"))
                    .stream()
                    .collect(Collectors.toMap(
                            Folder::getId,
                            Function.identity()));
        }

        for (NoteRequest note : noteRequest) {
            Folder parent = note.parentFolder() == null ? null : foldersInDatabase.get(note.parentFolder());
            Note newNote = Note.builder()
                    .id(note.id())
                    .title(note.title())
                    .folder(parent)
                    .content(note.content())
                    .workspace(workspace)
                    .updatedAt(now)
                    .build();

            processingNotes.add(newNote);
        }

        return new ArrayList<>(processingNotes);
    }

    public List<Note> updateNotes(List<NoteRequest> noteRequest, Workspace workspace) {
        Instant now = Instant.now();

        Set<UUID> folderParentIds = noteRequest.stream().map(NoteRequest::parentFolder).filter(Objects::nonNull)
                .collect(Collectors.toSet());
        Set<UUID> noteIds = noteRequest.stream().map(NoteRequest::id).collect(Collectors.toSet());

        Map<UUID, Folder> foldersInDatabase = folderRepository
                .findAllByWorkspaceIdAndIds(workspace.getId(), folderParentIds)
                .orElse(Collections.emptyList()).stream()
                .collect(Collectors.toMap(Folder::getId, Function.identity()));

        Map<UUID, Note> existingNotes = noteRepository.findAllById(noteIds)
                .stream()
                .collect(Collectors.toMap(Note::getId, Function.identity()));

        List<Note> notesToSave = new ArrayList<>();

        for (NoteRequest note : noteRequest) {
            Note existingNote = existingNotes.get(note.id());
            if (existingNote == null)
                continue;

            existingNote.setTitle(note.title());
            existingNote.setFolder(foldersInDatabase.get(note.parentFolder()));
            existingNote.setWorkspace(workspace);
            existingNote.setUpdatedAt(now);

            if (note.isContentAltered()) {
                existingNote.setContent(note.content());
            }

            notesToSave.add(existingNote);
        }

        return notesToSave;
    }

    public List<UUID> deleteNotes(List<UUID> ids, Workspace workspace) {
        List<Note> notesToBeDeleted = noteRepository.findAllById(ids);

        if (notesToBeDeleted.isEmpty()) {
            throw new EntityNotFoundException("No note found");
        }

        List<UUID> validatedIds = notesToBeDeleted.stream()
                .filter(n -> n.getWorkspace() != null
                        && workspace.getId().equals(n.getWorkspace().getId()))
                .map(Note::getId)
                .collect(Collectors.toList());

        if (validatedIds.size() == notesToBeDeleted.size()) {
            return ids;
        } else {
            throw new IllegalArgumentException(
                    "Correspondent length of ids does not match the number inserted: "
                            + ids.stream().filter(id -> !validatedIds.contains(id))
                                    .toList());
        }
    }
}
