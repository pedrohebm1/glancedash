import {
  addWorkspace,
  getWorkspaces,
} from "@/db/repositories/WorkspaceRepository";
import { SQLiteDatabase } from "expo-sqlite";
import { useState } from "react";

interface Workspace {
  workspaceId: string;
  title: string;
  noteCount: number;
}

export function useWorkspaces(db: SQLiteDatabase) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);

  const saveWorkspace = async (data: { name: string; version?: string }) => {
    const workspace = await addWorkspace(db, { name: data.name });

    if (workspace) {
      const newWorkspace: Workspace = {
        workspaceId: workspace.id,
        title: workspace.name,
        noteCount: workspace.note_count,
      };
      setWorkspaces([...workspaces, newWorkspace]);
    }
  };

  const deleteWorkspace = (id: string) => {};

  const loadWorkspaces = async () => {
    const workspacesDb = await getWorkspaces(db);

    if (workspacesDb) {
      let newList: Workspace[] = workspacesDb.map((w) => {
        return { title: w.name, workspaceId: w.id, noteCount: w.note_count };
      });
      setWorkspaces(newList);
    }
  };

  return { workspaces, saveWorkspace, loadWorkspaces, deleteWorkspace };
}
