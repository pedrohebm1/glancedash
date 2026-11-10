import { type SQLiteDatabase } from "expo-sqlite";

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
  const DATABASE_VERSION = 1;

  await db.execAsync("PRAGMA foreign_keys = ON;");

  const result = await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version",
  );

  let currentDbVersion = result?.user_version ?? 0;

  if (currentDbVersion >= DATABASE_VERSION) {
    return;
  }

  if (currentDbVersion === 0) {
    console.log("Migrating to version 1");
    await db.execAsync(`
      CREATE TABLE workspace (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,

        version INTEGER NOT NULL DEFAULT 0,
        is_created INTEGER NOT NULL DEFAULT 0,
        is_deleted INTEGER NOT NULL DEFAULT 0,
        is_synced INTEGER NOT NULL DEFAULT 0,

        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE folder (
        id TEXT PRIMARY KEY NOT NULL,
        workspace_id TEXT NOT NULL,
        parent_folder_id TEXT,

        name TEXT NOT NULL,

        is_deleted INTEGER NOT NULL DEFAULT 0,
        is_synced INTEGER NOT NULL DEFAULT 0,

        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),

        FOREIGN KEY (workspace_id)
          REFERENCES workspace(id)
          ON DELETE CASCADE,

        FOREIGN KEY (parent_folder_id)
          REFERENCES folder(id)
          ON DELETE CASCADE
      );

      CREATE TABLE note (
        id TEXT PRIMARY KEY NOT NULL,

        workspace_id TEXT NOT NULL,
        folder_id TEXT,

        title TEXT NOT NULL,
        content TEXT NOT NULL,

        is_deleted INTEGER NOT NULL DEFAULT 0,
        is_synced INTEGER NOT NULL DEFAULT 0,

        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),

        FOREIGN KEY (workspace_id)
          REFERENCES workspace(id)
          ON DELETE CASCADE,

        FOREIGN KEY (folder_id)
          REFERENCES folder(id)
          ON DELETE SET NULL
      );

      CREATE TABLE recent_note (
        id TEXT PRIMARY KEY NOT NULL,
        note_id TEXT NOT NULL UNIQUE,
        accessed_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (note_id) REFERENCES note(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_recent_accessed ON recent_note(accessed_at);

      CREATE INDEX IF NOT EXISTS idx_folder_workspace
      ON folder(workspace_id);

      CREATE INDEX IF NOT EXISTS idx_folder_parent
      ON folder(parent_folder_id);

      CREATE INDEX IF NOT EXISTS idx_note_workspace
      ON note(workspace_id);

      CREATE INDEX IF NOT EXISTS idx_note_folder
      ON note(folder_id);

      CREATE INDEX IF NOT EXISTS idx_note_updated
      ON note(updated_at);
    `);

    currentDbVersion = 1;
  }

  if (currentDbVersion === 1) {
    await db.execAsync(`
      CREATE TABLE pending_changes (
        id TEXT PRIMARY KEY NOT NULL,
        workspaceId TEXT NOT NULL,
        entityType TEXT NOT NULL,
        entityId TEXT NOT NULL,
        operation TEXT NOT NULL,
        createdAt TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);
    currentDbVersion = 2;
  }
  // Set the final target database version
  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}
