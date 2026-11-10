import { trackPendingChange } from "@/db/repositories/PendingChangesRepository";
import { SQLiteDatabase } from "expo-sqlite";

interface ManageModificationParams {
  entityType: "NOTE" | "FOLDER";
  entityName: string;
  entityId: string;
  operation: "CREATE" | "UPDATE" | "DELETE";
  workspaceId: string;
  parentFolderId: string | null;
  db: SQLiteDatabase;
}

export async function StoreModification(params: ManageModificationParams) {
  try {
    await trackPendingChange(params.db, {
      entityId: params.entityId,
      entityType: params.entityType,
      operation: params.operation,
      workspaceId: params.workspaceId,
    });
  } catch (err) {
    console.error("Erro ao registrar modificação pendente:", err);
  }
}
