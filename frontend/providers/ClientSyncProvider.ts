import { PushWorkspaceChanges } from "@/services/workspace";
import { SQLiteDatabase } from "expo-sqlite";
import { create } from "zustand";

const DEBOUNCE_MS = 1000;

type SyncState = {
  timers: Record<string, ReturnType<typeof setTimeout>>;
  scheduleSync: (db: SQLiteDatabase, workspaceId: string) => void;
};

export const ClientSyncProvider = create<SyncState>((set, get) => ({
  timers: {},
  scheduleSync: (db, workspaceId) => {
    clearTimeout(get().timers[workspaceId]);

    const timer = setTimeout(async () => {
      set((s) => {
        const { [workspaceId]: _, ...rest } = s.timers;
        return { timers: rest };
      });

      try {
        await PushWorkspaceChanges(db, workspaceId);
      } catch (err) {
        console.error("Falha no sync:", err);
      }
    }, DEBOUNCE_MS);

    set((s) => ({ timers: { ...s.timers, [workspaceId]: timer } }));
  },
}));
