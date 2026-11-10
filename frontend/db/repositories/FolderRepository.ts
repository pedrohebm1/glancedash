import { SQLiteBindValue, SQLiteDatabase } from 'expo-sqlite';
import uuid from 'react-native-uuid';

export interface FolderInput {
    workspace_id: string;
    parent_folder_id?: string | null;
    name: string;
}

export interface Folder extends FolderInput {
    id: string;
    parent_folder_id: string | null;
    is_deleted: boolean;
    created_at: string;
    updated_at: string;
}

export async function addFolder(
    db: SQLiteDatabase,
    folder: FolderInput
): Promise<Folder | null> {
    try {
        const folderId = uuid.v4().toString();

        await db.runAsync(
            `INSERT INTO folder (
                id,
                workspace_id,
                parent_folder_id,
                name,
                is_deleted,
                created_at,
                updated_at
            )
            VALUES (?, ?, ?, ?, 0, datetime('now'), datetime('now'));`,
            [
                folderId,
                folder.workspace_id,
                folder.parent_folder_id ?? null,
                folder.name,
            ]
        );

        return await db.getFirstAsync<Folder>(
            `SELECT *
             FROM folder
             WHERE id = ?`,
            [folderId]
        );
    } catch (error) {
        console.error('Error adding folder:', error);
        throw error;
    }
}

export async function getFolderById(
    db: SQLiteDatabase,
    id: string
): Promise<Folder | null> {
    try {
        return await db.getFirstAsync<Folder>(
            `SELECT *
             FROM folder
             WHERE id = ?
             AND is_deleted = 0`,
            [id]
        );
    } catch (error) {
        console.error('Error getting folder:', error);
        return null;
    }
}

export async function getFoldersByWorkspace(
    db: SQLiteDatabase,
    workspaceId: string
): Promise<Folder[]> {
    try {
        return await db.getAllAsync<Folder>(
            `SELECT *
             FROM folder
             WHERE workspace_id = ?
             AND is_deleted = 0
             ORDER BY created_at ASC`,
            [workspaceId]
        );
    } catch (error) {
        console.error('Error getting workspace folders:', error);
        return [];
    }
}

export async function getChildFolders(
    db: SQLiteDatabase,
    parentFolderId: string
): Promise<Folder[]> {
    try {
        return await db.getAllAsync<Folder>(
            `SELECT *
             FROM folder
             WHERE parent_folder_id = ?
             AND is_deleted = 0
             ORDER BY name ASC`,
            [parentFolderId]
        );
    } catch (error) {
        console.error('Error getting child folders:', error);
        return [];
    }
}

export async function getRootFolders(
    db: SQLiteDatabase,
    workspaceId: string
): Promise<Folder[]> {
    try {
        return await db.getAllAsync<Folder>(
            `SELECT *
             FROM folder
             WHERE workspace_id = ?
             AND parent_folder_id IS NULL
             AND is_deleted = 0
             ORDER BY name ASC`,
            [workspaceId]
        );
    } catch (error) {
        console.error('Error getting root folders:', error);
        return [];
    }
}

export async function updateFolderAsync(
    db: SQLiteDatabase,
    id: string,
    updateData: Partial<Pick<FolderInput, 'name' | 'parent_folder_id'>>
): Promise<void> {
    try {
        const fieldsToUpdate: string[] = [];
        const valuesToUpdate: SQLiteBindValue[] = [];

        if (updateData.name !== undefined) {
            fieldsToUpdate.push('name = ?');
            valuesToUpdate.push(updateData.name);
        }

        if (updateData.parent_folder_id !== undefined) {
            fieldsToUpdate.push('parent_folder_id = ?');
            valuesToUpdate.push(updateData.parent_folder_id);
        }

        if (fieldsToUpdate.length === 0) {
            return;
        }

        fieldsToUpdate.push(`updated_at = datetime('now')`);
        fieldsToUpdate.push(`is_synced = 0`);

        valuesToUpdate.push(id);

        await db.runAsync(
            `UPDATE folder
             SET ${fieldsToUpdate.join(', ')}
             WHERE id = ?
             AND is_deleted = 0`,
            valuesToUpdate
        );
    } catch (error) {
        console.error('Error updating folder:', error);
        throw error;
    }
}

export async function moveFolderAsync(
    db: SQLiteDatabase,
    id: string,
    parentFolderId: string | null
): Promise<void> {
    try {
        await db.runAsync(
            `UPDATE folder
             SET
                parent_folder_id = ?,
                updated_at = datetime('now'),
                is_synced = 0
             WHERE id = ?
             AND is_deleted = 0`,
            [parentFolderId, id]
        );
    } catch (error) {
        console.error('Error moving folder:', error);
        throw error;
    }
}

export async function deleteFolderAsync(
    db: SQLiteDatabase,
    id: string
): Promise<void> {
    try {
        const folder = await db.getFirstAsync<{
            is_synced: number;
        }>(
            `SELECT is_synced
             FROM folder
             WHERE id = ?`,
            [id]
        );

        if (!folder) {
            return;
        }

        if (folder.is_synced === 0) {
            await db.runAsync(
                `DELETE FROM folder WHERE id = ?`,
                [id]
            );
        } else {
            await db.runAsync(
                `UPDATE folder
                 SET
                    is_deleted = 1,
                    is_synced = 0,
                    updated_at = datetime('now')
                 WHERE id = ?`,
                [id]
            );
        }
    } catch (error) {
        console.error('Error deleting folder:', error);
        throw error;
    }
}

export async function getUnsyncedFolders(
    db: SQLiteDatabase
): Promise<Folder[]> {
    try {
        return await db.getAllAsync<Folder>(
            `SELECT *
             FROM folder
             WHERE is_synced = 0`
        );
    } catch (error) {
        console.error('Error getting unsynced folders:', error);
        return [];
    }
}