import {
    addFolder,
    FolderInput,
    getFoldersByWorkspace,
} from "@/db/repositories/FolderRepository";
import {
    addNote,
    getNotesByWorkspace,
    NoteInput,
} from "@/db/repositories/NoteRepository";
import { SQLiteDatabase } from "expo-sqlite";
import { useState } from "react";

interface Note {
  id: string;
  name: string;
  parentFolderId: string | null;
}

interface Folder {
  id: string;
  name: string;
  parentFolderId: string | null;
}

interface Workspace {
  id: string;
  name: string;
}

export function useWorkspace(db: SQLiteDatabase, workspace: Workspace) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);

  const refreshActiveTree = async () => {
    if (workspace) {
      const [foldersFetch, notesFetch] = await Promise.all([
        getFoldersByWorkspace(db, workspace.id),
        getNotesByWorkspace(db, workspace.id),
      ]);

      setNotes(
        notesFetch.map((n) => {
          const data: Note = {
            id: n.id,
            name: n.title,
            parentFolderId: n.folder_id,
          };
          return data;
        }),
      );
      setFolders(
        foldersFetch.map((f) => {
          const data: Folder = {
            id: f.id,
            name: f.name,
            parentFolderId: f.parent_folder_id,
          };
          return data;
        }),
      );
    }
  };

  const createNote = async (name: string, parentFolderId: string | null) => {
    const data: NoteInput = {
      workspace_id: workspace.id,
      folder_id: parentFolderId,
      title: name.trim(),
      content: "",
    };
    await addNote(db, data);
  };

  const createFolder = async (name: string, parentFolderId: string | null) => {
    const data: FolderInput = {
      workspace_id: workspace.id,
      parent_folder_id: parentFolderId,
      name: name.trim(),
    };
    await addFolder(db, data);
  };

  return { workspace, notes, folders, refreshActiveTree };
}
