import { addRecentNote, getRecentNotes } from "@/db/repositories/RecentNotes";
import { SQLiteDatabase } from "expo-sqlite";
import { useState } from "react";

interface RecentNote {
  noteId: string;
  title: string;
  contentPreview: string;
  accessed_at: string;
  workspaceId: string;
}

export function useRecentNotes(db: SQLiteDatabase) {
  const [recentNotes, setRecentNotes] = useState<RecentNote[]>([]);

  const saveRecentNote = async (data: {
    id: string;
    name: string;
    version?: string;
  }) => {
    await addRecentNote(db, { note_id: data.id });
  };
  const loadRecentNotes = async () => {
    const recentNotesDb = await getRecentNotes(db);

    if (recentNotesDb) {
      let newList: RecentNote[] = recentNotesDb.map((n) => {
        return {
          noteId: n.note_id,
          title: n.title,
          contentPreview: n.content_preview,
          workspaceId: n.workspace_id,
          accessed_at: n.accessed_at,
        };
      });
      setRecentNotes(newList);
    }
  };

  return { recentNotes, saveRecentNote, loadRecentNotes };
}
