import { SQLiteDatabase } from "expo-sqlite";
import uuid from "react-native-uuid";

export interface WorkspaceInput {
  name?: string;
  version?: number;
}

export interface Workspace extends WorkspaceInput {
  id: string;
  name: string;
  is_created: number;
  is_synced: number;
  is_deleted: number;
  created_at: string;
  updated_at: string;
  note_count: number;
  version: number;
}

export async function addWorkspace(
  db: SQLiteDatabase,
  workspace: WorkspaceInput = {},
): Promise<Workspace | null> {
  try {
    const uuidGenerated = uuid.v4();
    const workspaceName = workspace.name?.toString() ?? uuid.v4().toString();
    await db.runAsync(
      `INSERT INTO workspace (
                id,
                name,
                version,
                is_deleted,
                is_synced,
                created_at,
                updated_at
            )
            VALUES (?, ?, ?, 0, 0, datetime('now'), datetime('now'));`,
      [uuidGenerated, workspaceName, workspace.version ? workspace.version : 1],
    );

    return await db.getFirstAsync<Workspace>(
      `SELECT * FROM workspace WHERE id = ?`,
      [uuidGenerated],
    );
  } catch (error) {
    console.error("Error adding workspace:", error);
    throw error;
  }
}

export async function updateWorkspaceById(
  db: SQLiteDatabase,
  workspace: Workspace,
): Promise<Workspace | null> {
  try {
    console.log(workspace);
    console.log("para criar:" + workspace.is_created);
    await db.runAsync(
      `UPDATE workspace
          SET name = ?,
              version = ?,
              is_synced = ?,
              is_created = ?,
              updated_at = datetime('now')
        WHERE id = ?`,
      [
        workspace.name,
        workspace.version,
        workspace.is_synced,
        workspace.is_created,
        workspace.id,
      ],
    );

    return await db.getFirstAsync<Workspace>(
      `SELECT * FROM workspace WHERE id = ?`,
      [workspace.id],
    );
  } catch (error) {
    console.error("Error updating workspace:", error);
    throw error;
  }
}

export async function getWorkspaceById(
  db: SQLiteDatabase,
  id: string,
): Promise<Workspace | null> {
  try {
    return await db.getFirstAsync<Workspace>(
      `SELECT *
             FROM workspace
             WHERE id = ?
             AND is_deleted = 0`,
      [id],
    );
  } catch (error) {
    console.error("Error getting workspace:", error);
    return null;
  }
}

export async function getWorkspaces(db: SQLiteDatabase): Promise<Workspace[]> {
  try {
    const data = await db.getAllAsync<Workspace>(
      `SELECT 
    workspace.id,
    workspace.name,
    COUNT(note.id) AS note_count
FROM workspace
LEFT JOIN note
    ON workspace.id = note.workspace_id
WHERE workspace.is_deleted = 0
GROUP BY workspace.id
ORDER BY workspace.created_at DESC;
             `,
    );

    return data;
  } catch (error) {
    console.error("Error getting workspaces:", error);
    return [];
  }
}

export async function setWorkspacesSynced(
  db: SQLiteDatabase,
  workspaces: Array<{ id: string; version: number }>,
): Promise<void> {
  await db.withTransactionAsync(async () => {
    for (const { id, version } of workspaces) {
      await db.runAsync(
        `UPDATE workspace
            SET updated_at = datetime('now'),
                version = ?,
                is_synced = 1
          WHERE id = ?
            AND is_deleted = 0`,
        [version, id],
      );
    }
  });
}

export async function deleteWorkspaceAsync(
  db: SQLiteDatabase,
  id: string,
): Promise<void> {
  try {
    const workspace = await db.getFirstAsync<{
      is_synced: number;
    }>(
      `SELECT is_synced
             FROM workspace
             WHERE id = ?`,
      [id],
    );

    if (!workspace) {
      return;
    }

    if (workspace.is_synced === 0) {
      await db.runAsync(`DELETE FROM workspace WHERE id = ?`, [id]);
    } else {
      await db.runAsync(
        `UPDATE workspace
                 SET
                    is_deleted = 1,
                    is_synced = 0,
                    updated_at = datetime('now')
                 WHERE id = ?`,
        [id],
      );
    }
  } catch (error) {
    console.error("Error deleting workspace:", error);
    throw error;
  }
}

export async function getUnsyncedWorkspaces(
  db: SQLiteDatabase,
): Promise<Workspace[]> {
  try {
    return await db.getAllAsync<Workspace>(
      `SELECT *
             FROM workspace
             WHERE is_synced = 0`,
    );
  } catch (error) {
    console.error("Error getting unsynced workspaces:", error);
    return [];
  }
}
