package com.pedrohenrique.backend.service.workspace.note;

import java.util.List;

import com.pedrohenrique.backend.dto.structure.NoteStructureDto;
import com.pedrohenrique.backend.model.note.Note;

public class NoteMapper {
    public static List<NoteStructureDto> toNoteStructure(List<Note> note) {
        return note.stream().map(n ->
            NoteStructureDto.builder()
                .id(n.getId())
                .title(n.getTitle())
                .parentFolderId(n.getFolder().getId())
                .build()
        ).toList();
    }
}
