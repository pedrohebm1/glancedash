import {
  clearSyncedPendingChanges,
  getPendingPayloads,
  PendingFolderPayload,
  PendingNotePayload,
} from "@/db/repositories/PendingChangesRepository";
import {
  deleteWorkspaceAsync,
  getWorkspaceById,
  getWorkspaces,
  updateWorkspaceById,
} from "@/db/repositories/WorkspaceRepository";
import { SQLiteDatabase } from "expo-sqlite";
import { Alert } from "react-native";
import { api } from "./api";

interface NoteRequest {
  id: string;
  title: string;
  content?: string | null;
  parentFolder?: string | null;
  isContentAltered?: boolean;
}

interface FolderRequest {
  id: string;
  name: string;
  parentFolder?: string | null;
}

interface EntitySyncRequest<T> {
  created: T[];
  updated: T[];
  deleted: string[];
}

interface WorkspaceSyncDto {
  workspaceId: string;
  version: number;
  notes: EntitySyncRequest<NoteRequest>;
  folders: EntitySyncRequest<FolderRequest>;
}

interface WorkspaceSyncResponse {
  id: string;
  version: number;
}

function changesMapper(
  notes: PendingNotePayload[],
  folders: PendingFolderPayload[],
) {
  const notesPayload: EntitySyncRequest<NoteRequest> = {
    created: notes
      .filter((n) => n.operation === "CREATE")
      .map((n) => ({
        id: n.entityId,
        title: n.title ?? "",
        content: n.content ?? "",
        parentFolder: n.folderId,
        isContentAltered: true,
      })),

    updated: notes
      .filter((n) => n.operation === "UPDATE")
      .map((n) => ({
        id: n.entityId,
        title: n.title ?? "",
        content: n.content ?? "",
        parentFolder: n.folderId,
        isContentAltered: true,
      })),

    deleted: notes
      .filter((n) => n.operation === "DELETE")
      .map((n) => n.entityId),
  };

  const foldersPayload: EntitySyncRequest<FolderRequest> = {
    created: folders
      .filter((f) => f.operation === "CREATE")
      .map((f) => ({
        id: f.entityId,
        name: f.name ?? "",
        parentFolder: f.parentFolderId,
      })),

    updated: folders
      .filter((f) => f.operation === "UPDATE")
      .map((f) => ({
        id: f.entityId,
        name: f.name ?? "",
        parentFolder: f.parentFolderId,
      })),

    deleted: folders
      .filter((f) => f.operation === "DELETE")
      .map((f) => f.entityId),
  };

  return { notesPayload, foldersPayload };
}

export async function syncWorkspace(db: SQLiteDatabase, workspaceId: string) {
  const workspace = await getWorkspaceById(db, workspaceId);

  try {
    if (workspace) {
      if (workspace.is_created == 0) {
        console.log("para criar");
        const payload = {
          workspaceId: workspace.id,
          name: workspace.name,
        };
        console.log(payload);
        const response = await api.post("/workspace", payload);

        if (response.status === 200) {
          await updateWorkspaceById(db, {
            ...workspace,
            is_created: 1,
            is_synced: 1,
          });
        }
      } else {
        console.log("aaaaayy");
        const payload = {
          name: workspace.name,
        };
        const response = await api.put("/workspace" + workspace.id, payload);

        if (response.status === 200) {
          workspace.is_synced = 1;
          await updateWorkspaceById(db, workspace);
        }
      }
      if (workspace?.is_deleted === 1) {
        const response = await api.delete("/workspace" + workspaceId);

        if (response.status === 200) {
          await deleteWorkspaceAsync(db, workspaceId);
        }
      }
    }
  } catch (err) {
    throw err;
  }
}

export async function PushWorkspaceChanges(
  db: SQLiteDatabase,
  workspaceId: string,
) {
  try {
    const pendingChanges = await getPendingPayloads(db, workspaceId);

    if (
      pendingChanges.notes.length === 0 &&
      pendingChanges.folders.length === 0
    ) {
      return;
    }

    const workspace = await getWorkspaceById(db, workspaceId);

    if (!workspace) throw new Error("Workspace not found");

    if (workspace.is_created === 0 || workspace.is_synced === 0) {
      await syncWorkspace(db, workspaceId);
    }

    const { notesPayload, foldersPayload } = changesMapper(
      pendingChanges.notes,
      pendingChanges.folders,
    );

    const payload: WorkspaceSyncDto = {
      workspaceId: workspaceId,
      version: workspace.version,
      notes: notesPayload,
      folders: foldersPayload,
    };
    const response = await api.post("/workspace/sync", payload);

    if (response.status === 200) {
      console.log("version from server:" + response.data.version);
      const newWorkspace = await getWorkspaceById(db, workspaceId);

      if (!newWorkspace) {
        throw new Error("Workspace not found after sync");
      }

      await updateWorkspaceById(db, {
        ...newWorkspace,
        id: newWorkspace.id ?? workspaceId,
        version: response.data.version,
      });

      console.log("data:" + response.data);
      await getWorkspaceById(db, workspaceId);

      const pendingIdsToClear: string[] = Array.prototype.concat(
        pendingChanges.folders.map((f) => f.entityId),
        pendingChanges.notes.map((f) => f.entityId),
      );
      await clearSyncedPendingChanges(db, workspaceId, pendingIdsToClear);
    }

    return response.data;
  } catch (err: any) {
    console.log(err);

    if (err.response) {
      const responseData = err.response.data;
      const responseStatus = err.response.status;
      Alert.alert("Erro", responseData.description);
    } else if (err.request) {
      console.log("Sem resposta do servidor");
    } else {
      console.log("Erro:", err.message);
    }
  }
}

interface WorkspaceResponse {
  id: string;
  name: string;
  version: number;
}

export async function syncLocalWorkspaces(db: SQLiteDatabase) {
  try {
    const response = await api.get<WorkspaceResponse[]>("/workspaces");

    const mappedResponse = new Map<string, WorkspaceResponse>(
      response.data.map((w) => [w.id, w]),
    );

    const workspaces = await getWorkspaces(db);
    if (response.status === 200) {
      const unsyncedWorkspaceVersionIds: string[] = workspaces
        .filter((w) => mappedResponse.has(w.id))
        .map((w) => w.id);
      const unsyncedDeletedWorkspaceIds: string[] = workspaces
        .filter((w) => !mappedResponse.has(w.id) && w.is_created === 0)
        .map((w) => w.id);

      for (const id of unsyncedWorkspaceVersionIds) {
        const workspace = mappedResponse.get(id);
        const remoteWorkspace = workspaces.find((w) => w.id === id);
        if (workspace && remoteWorkspace) {
          await updateWorkspaceById(db, {
            ...remoteWorkspace,
            name: workspace.name,
          });
        }
      }

      for (const id of unsyncedDeletedWorkspaceIds) {
        const workspace = workspaces.find((w) => w.id === id);
        if (workspace) {
          await deleteWorkspaceAsync(db, id);
        }
      }
    }
  } catch (err) {
    console.log(err);
  }
}
