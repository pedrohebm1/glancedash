import { SQLiteBindValue, SQLiteDatabase } from "expo-sqlite";
import uuid from "react-native-uuid";

export interface NoteInput {
  workspace_id: string;
  folder_id?: string | null;
  title: string;
  content?: string | null;
}

export interface Note extends NoteInput {
  id: string;
  folder_id: string | null;
  is_synced: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export async function addNote(
  db: SQLiteDatabase,
  note: NoteInput,
): Promise<Note | null> {
  try {
    const noteId = uuid.v4().toString();

    await db.runAsync(
      `INSERT INTO note (
                id,
                workspace_id,
                folder_id,
                title,
                content,
                is_synced,
                is_deleted,
                created_at,
                updated_at
            )
            VALUES (?, ?, ?, ?, ?, 0, 0, datetime('now'), datetime('now'));`,
      [
        noteId,
        note.workspace_id,
        note.folder_id ?? null,
        note.title,
        note.content ?? "",
      ],
    );

    return await db.getFirstAsync<Note>(
      `SELECT *
             FROM note
             WHERE id = ?`,
      [noteId],
    );
  } catch (error) {
    console.error("Error adding note:", error);
    throw error;
  }
}

export async function getNoteById(
  db: SQLiteDatabase,
  id: string,
): Promise<Note | null> {
  try {
    return await db.getFirstAsync<Note>(
      `SELECT *
             FROM note
             WHERE id = ?
             AND is_deleted = 0`,
      [id],
    );
  } catch (error) {
    console.error("Error getting note:", error);
    return null;
  }
}

export async function getNotesByWorkspace(
  db: SQLiteDatabase,
  workspaceId: string,
): Promise<Note[]> {
  try {
    return await db.getAllAsync<Note>(
      `SELECT *
             FROM note
             WHERE workspace_id = ?
             AND is_deleted = 0
             ORDER BY updated_at DESC`,
      [workspaceId],
    );
  } catch (error) {
    console.error("Error getting workspace notes:", error);
    return [];
  }
}

export async function getNotesByFolder(
  db: SQLiteDatabase,
  folderId: string,
): Promise<Note[]> {
  try {
    return await db.getAllAsync<Note>(
      `SELECT *
             FROM note
             WHERE folder_id = ?
             AND is_deleted = 0
             ORDER BY updated_at DESC`,
      [folderId],
    );
  } catch (error) {
    console.error("Error getting folder notes:", error);
    return [];
  }
}

export async function searchNotesAsync(
  db: SQLiteDatabase,
  workspaceId: string,
  searchQuery: string,
): Promise<Note[]> {
  try {
    const searchPattern = `%${searchQuery}%`;

    return await db.getAllAsync<Note>(
      `SELECT *
             FROM note
             WHERE workspace_id = ?
             AND is_deleted = 0
             AND (
                title LIKE ?
                OR content LIKE ?
             )
             ORDER BY updated_at DESC`,
      [workspaceId, searchPattern, searchPattern],
    );
  } catch (error) {
    console.error("Error searching notes:", error);
    return [];
  }
}

export async function updateNoteAsync(
  db: SQLiteDatabase,
  id: string,
  updateData: Partial<Pick<NoteInput, "title" | "content" | "folder_id">>,
): Promise<void> {
  try {
    const fieldsToUpdate: string[] = [];
    const valuesToUpdate: SQLiteBindValue[] = [];

    if (updateData.title !== undefined) {
      fieldsToUpdate.push("title = ?");
      valuesToUpdate.push(updateData.title);
    }

    if (updateData.content !== undefined) {
      fieldsToUpdate.push("content = ?");
      valuesToUpdate.push(updateData.content ?? "");
    }

    if (updateData.folder_id !== undefined) {
      const safeFolderId =
        updateData.folder_id && updateData.folder_id.trim() !== ""
          ? updateData.folder_id
          : null;

      fieldsToUpdate.push("folder_id = ?");
      valuesToUpdate.push(safeFolderId);
    }

    if (fieldsToUpdate.length === 0) {
      return;
    }

    fieldsToUpdate.push(`updated_at = datetime('now')`);
    fieldsToUpdate.push(`is_synced = 0`);

    valuesToUpdate.push(id);

    await db.runAsync(
      `UPDATE note
             SET ${fieldsToUpdate.join(", ")}
             WHERE id = ? AND is_deleted = 0`,
      valuesToUpdate,
    );
  } catch (error) {
    console.error("Error updating note:", error);
    throw error;
  }
}

export async function moveNoteAsync(
  db: SQLiteDatabase,
  id: string,
  folderId: string | null,
): Promise<void> {
  try {
    await db.runAsync(
      `UPDATE note
             SET
                folder_id = ?,
                updated_at = datetime('now'),
                is_synced = 0
             WHERE id = ?
             AND is_deleted = 0`,
      [folderId, id],
    );
  } catch (error) {
    console.error("Error moving note:", error);
    throw error;
  }
}

export async function deleteNoteAsync(
  db: SQLiteDatabase,
  id: string,
): Promise<void> {
  try {
    const note = await db.getFirstAsync<{
      is_synced: number;
    }>(
      `SELECT is_synced
             FROM note
             WHERE id = ?`,
      [id],
    );

    if (!note) {
      return;
    }

    if (note.is_synced === 0) {
      await db.runAsync(
        `DELETE FROM note
                 WHERE id = ?`,
        [id],
      );
    } else {
      await db.runAsync(
        `UPDATE note
                 SET
                    is_deleted = 1,
                    is_synced = 0,
                    updated_at = datetime('now')
                 WHERE id = ?`,
        [id],
      );
    }
  } catch (error) {
    console.error("Error deleting note:", error);
    throw error;
  }
}

export async function getUnsyncedNotes(db: SQLiteDatabase): Promise<Note[]> {
  try {
    return await db.getAllAsync<Note>(
      `SELECT *
             FROM note
             WHERE is_synced = 0`,
    );
  } catch (error) {
    console.error("Error getting unsynced notes:", error);
    return [];
  }
}
