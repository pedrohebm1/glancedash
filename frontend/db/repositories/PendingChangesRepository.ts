import { SQLiteDatabase } from "expo-sqlite";
import uuid from "react-native-uuid";

export interface PendingChangesInput {
  workspaceId: string;
  entityType: "NOTE" | "FOLDER";
  entityId: string;
  operation: "CREATE" | "UPDATE" | "DELETE";
}

export interface PendingNotePayload {
  pendingId: string;
  operation: "CREATE" | "UPDATE" | "DELETE";
  workspaceId: string;
  entityId: string;
  folderId?: string | null;
  title?: string;
  content?: string | null;
}

export interface PendingFolderPayload {
  pendingId: string;
  operation: "CREATE" | "UPDATE" | "DELETE";
  workspaceId: string;
  entityId: string;
  parentFolderId?: string | null;
  name?: string;
}

export interface PendingChanges extends PendingChangesInput {
  id: string;
  createdAt: string;
}
export async function getPendingPayloads(
  db: SQLiteDatabase,
  workspaceId: string,
) {
  const notes = await db.getAllAsync<PendingNotePayload>(
    `
    SELECT
      pc.id AS pendingId,
      pc.operation,
      pc.workspaceId,
      pc.entityId,
      n.folder_id AS folderId,
      n.title,
      n.content
    FROM pending_changes pc
    LEFT JOIN note n
      ON pc.entityId = n.id
     AND n.workspace_id = pc.workspaceId
    WHERE pc.entityType = 'NOTE'
      AND pc.workspaceId = ?
    ORDER BY pc.createdAt ASC
  `,
    [workspaceId],
  );

  const folders = await db.getAllAsync<PendingFolderPayload>(
    `
      SELECT
        pc.id AS pendingId,
        pc.operation,
        pc.workspaceId,
        pc.entityId,
        f.parent_folder_id AS parentFolderId,
        f.name
      FROM pending_changes pc
      LEFT JOIN folder f
        ON pc.entityId = f.id
      WHERE pc.entityType = 'FOLDER'
        AND pc.workspaceId = ?
      ORDER BY pc.createdAt ASC
    `,
    [workspaceId],
  );

  return {
    notes,
    folders,
  };
}

export async function trackPendingChange(
  db: SQLiteDatabase,
  input: PendingChangesInput,
): Promise<void> {
  await db.withTransactionAsync(async () => {
    const existing = await db.getFirstAsync<{
      id: string;
      operation: "CREATE" | "UPDATE" | "DELETE";
    }>(
      `
        SELECT id, operation
        FROM pending_changes
        WHERE workspaceId = ?
          AND entityType = ?
          AND entityId = ?
      `,
      [input.workspaceId, input.entityType, input.entityId],
    );

    const insert = async (operation: "CREATE" | "UPDATE" | "DELETE") => {
      await db.runAsync(
        `
          INSERT INTO pending_changes (
            id,
            workspaceId,
            entityType,
            entityId,
            operation
          )
          VALUES (?, ?, ?, ?, ?)
        `,
        [
          uuid.v4() as string,
          input.workspaceId,
          input.entityType,
          input.entityId,
          operation,
        ],
      );
    };

    switch (input.operation) {
      case "CREATE": {
        if (!existing) {
          await insert("CREATE");
        }

        break;
      }

      case "UPDATE": {
        if (!existing) {
          await insert("UPDATE");
        }
        break;
      }

      case "DELETE": {
        if (!existing) {
          await insert("DELETE");
        } else if (existing.operation === "CREATE") {
          /*
           * A entidade foi criada localmente, mas ainda
           * não foi enviada ao servidor.
           *
           * Portanto, não há nada para deletar no servidor.
           */
          await db.runAsync(
            `
              DELETE FROM pending_changes
              WHERE id = ?
            `,
            [existing.id],
          );
        } else {
          await db.runAsync(
            `
              UPDATE pending_changes
              SET operation = 'DELETE'
              WHERE id = ?
            `,
            [existing.id],
          );
        }

        break;
      }
    }
  });
}

export async function clearSyncedPendingChanges(
  db: SQLiteDatabase,
  workspaceId: string,
  syncedPendingIds: string[],
): Promise<void> {
  if (syncedPendingIds.length === 0) {
    return;
  }

  const placeholders = syncedPendingIds.map(() => "?").join(", ");

  try {
    await db.withTransactionAsync(async () => {
      const noteResult = await db.runAsync(
        `
          DELETE FROM note
          WHERE id IN (
            SELECT entityId
            FROM pending_changes
            WHERE id IN (${placeholders})
              AND workspaceId = ?
              AND entityType = 'NOTE'
              AND operation = 'DELETE'
          )
        `,
        [...syncedPendingIds, workspaceId],
      );

      const folderResult = await db.runAsync(
        `
          DELETE FROM folder
          WHERE id IN (
            SELECT entityId
            FROM pending_changes
            WHERE id IN (${placeholders})
              AND workspaceId = ?
              AND entityType = 'FOLDER'
              AND operation = 'DELETE'
          )
        `,
        [...syncedPendingIds, workspaceId],
      );

      const pendingResult = await db.runAsync(
        `
          DELETE FROM pending_changes
          WHERE workspaceId = ?
            AND entityId IN (${placeholders}) -- MUDOU DE id PARA entityId
        `,
        [workspaceId, ...syncedPendingIds],
      );
      console.log(
        "Linhas de 'pending_changes' deletadas:",
        pendingResult.changes,
      );
    });

  } catch (error) {
    console.error("Erro ao limpar alterações pendentes:", error);
    throw error;
  }
}
