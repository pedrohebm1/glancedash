import { SQLiteDatabase } from 'expo-sqlite';
import uuid from 'react-native-uuid';

export interface RecentNoteInput {
    note_id: string;
}

export interface RecentNote extends RecentNoteInput {
    id: string;
    accessed_at: string;
    title: string;
    content_preview: string;
    workspace_id: string;
    folder_id: string | null;
}

export async function addRecentNote(
    db: SQLiteDatabase,
    input: RecentNoteInput,
    maxLimit: number = 10
): Promise<void> {
    try {
        await db.withTransactionAsync(async () => {
            const existing = await db.getFirstAsync<{ id: string }>(
                'SELECT id FROM recent_note WHERE note_id = ?',
                [input.note_id]
            );

            if (existing) {
                await db.runAsync(
                    `UPDATE recent_note 
                     SET accessed_at = datetime('now') 
                     WHERE note_id = ?;`,
                    [input.note_id]
                );
                return;
            }

            const countResult = await db.getFirstAsync<{ count: number }>(
                'SELECT COUNT(*) as count FROM recent_note;'
            );
            const currentCount = countResult?.count ?? 0;

            if (currentCount >= maxLimit) {
                await db.runAsync(
                    `UPDATE recent_note 
                     SET note_id = ?, accessed_at = datetime('now')
                     WHERE id = (
                         SELECT id FROM recent_note 
                         ORDER BY accessed_at ASC 
                         LIMIT 1
                     );`,
                    [input.note_id]
                );
            } else {
                const recentId = uuid.v4().toString();
                await db.runAsync(
                    `INSERT INTO recent_note (id, note_id, accessed_at)
                     VALUES (?, ?, datetime('now'));`,
                    [recentId, input.note_id]
                );
            }
        });
    } catch (error) {
        console.error('Error adding recent note:', error);
        throw error;
    }
}

export async function getRecentNotes(
    db: SQLiteDatabase,
    workspaceId?: string
): Promise<RecentNote[]> {
    try {
        let query = `
            SELECT 
                r.id,
                r.note_id,
                r.accessed_at,
                n.title,
                SUBSTR(n.content, 1, 100) AS content_preview,
                n.workspace_id,
                n.folder_id
            FROM recent_note r
            JOIN note n ON r.note_id = n.id
            WHERE n.is_deleted = 0
        `;

        const params: string[] = [];

        if (workspaceId) {
            query += ` AND n.workspace_id = ?`;
            params.push(workspaceId);
        }

        query += ` ORDER BY r.accessed_at DESC LIMIT 10;`;

        return await db.getAllAsync<RecentNote>(query, params);
    } catch (error) {
        console.error('Error fetching recent notes:', error);
        throw error;
    }
}

export async function removeRecentNote(
    db: SQLiteDatabase,
    noteId: string
): Promise<void> {
    try {
        await db.runAsync(
            `DELETE FROM recent_note WHERE note_id = ?;`,
            [noteId]
        );
    } catch (error) {
        console.error('Error removing recent note:', error);
        throw error;
    }
}