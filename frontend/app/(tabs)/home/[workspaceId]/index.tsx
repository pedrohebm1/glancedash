import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { TreeView } from "@/components/ui/linkedTreeView/TreeView";
import { TreeNode } from "@/components/ui/linkedTreeView/types";
import ModalForm from "@/components/ui/ModalForm";

import {
  addFolder,
  deleteFolderAsync,
  updateFolderAsync,
} from "@/db/repositories/FolderRepository";

import {
  addNote,
  deleteNoteAsync,
  updateNoteAsync,
} from "@/db/repositories/NoteRepository";
import { useSyncStore } from "@/hooks/useSyncStorage";

import { useWorkspace } from "@/hooks/useWorkspace";
import { getAuthKey } from "@/lib/SecureStore";
import { StoreModification } from "@/lib/SyncManager";

import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useMemo, useState } from "react";
import { Alert, StyleSheet, TouchableOpacity, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

type ModalState =
  | {
      type: "edit";
      entity: "folder" | "note";
      nodeId: string;
      defaultValue: string;
      parentFolderId: string | null;
    }
  | {
      type: "create";
      entity: "folder" | "note";
      parentFolderId: string | null;
    }
  | null;

type ItemMetadata = {
  type: "folder" | "note";
  parentFolderId: string | null;
};

export default function WorkspaceScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const scheduleSync = useSyncStore((s) => s.scheduleSync);

  const [modalState, setModalState] = useState<ModalState>(null);

  const [activeEditNodeId, setActiveEditNodeId] = useState<string | null>(null);

  const { workspaceId, workspaceName } = useLocalSearchParams<{
    workspaceId: string;
    workspaceName: string;
  }>();

  const { workspace, folders, notes, refreshActiveTree } = useWorkspace(db, {
    id: workspaceId,
    name: workspaceName,
  });

  /**
   * ---------------------------------------------------------
   * TREE DATA
   * ---------------------------------------------------------
   */

  const treeData = useMemo<TreeNode<ItemMetadata>[]>(() => {
    const safeFolders = folders ?? [];
    const safeNotes = notes ?? [];

    const toNoteNode = (
      n: (typeof safeNotes)[number],
    ): TreeNode<ItemMetadata> => ({
      id: n.id,
      label: n.name,
      iconName: "file-text",
      data: { type: "note", parentFolderId: n.parentFolderId ?? null },
    });

    const buildFolderNode = (
      folder: (typeof safeFolders)[number],
    ): TreeNode<ItemMetadata> => ({
      id: folder.id,
      label: folder.name,
      iconName: "folder-o",
      data: { type: "folder", parentFolderId: folder.parentFolderId ?? null },
      children: [
        ...safeFolders
          .filter((f) => f.parentFolderId === folder.id)
          .map(buildFolderNode),
        ...safeNotes
          .filter((n) => n.parentFolderId === folder.id)
          .map(toNoteNode),
      ],
    });

    return [
      ...safeFolders.filter((f) => !f.parentFolderId).map(buildFolderNode),
      ...safeNotes.filter((n) => !n.parentFolderId).map(toNoteNode),
    ];
  }, [folders, notes]);

  const trackChange = (params: {
    entityType: "FOLDER" | "NOTE";
    operation: "CREATE" | "UPDATE" | "DELETE";
    entityId: string;
    entityName: string;
    parentFolderId: string | null;
  }) => StoreModification({ db, workspaceId, ...params });

  const redirectToNoteById = (id: string) => {
    if (!id) return;

    router.push({
      pathname: "/(tabs)/home/[workspaceId]/[noteId]",
      params: {
        workspaceId,
        noteId: id,
      },
    });
  };

  const handleOpenCreateFolderDialog = (parentFolderId: string | null) => {
    setModalState({
      type: "create",
      entity: "folder",
      parentFolderId,
    });
  };

  const handleOpenCreateNoteDialog = (parentFolderId: string | null) => {
    setModalState({
      type: "create",
      entity: "note",
      parentFolderId,
    });
  };

  const handleConfirmCreate = async (name: string) => {
    console.log(modalState, activeEditNodeId);
    if (!modalState || modalState.type !== "create") return;

    const { entity, parentFolderId } = modalState;

    try {
      if (entity === "folder") {
        const folder = await addFolder(db, {
          workspace_id: workspaceId,
          name,
          parent_folder_id: parentFolderId,
        });

        if (folder) {
          await trackChange({
            entityType: "FOLDER",
            operation: "CREATE",
            entityId: folder?.id,
            entityName: name,
            parentFolderId,
          });
        }
      } else {
        const note = await addNote(db, {
          workspace_id: workspaceId,
          title: name,
          folder_id: parentFolderId,
        });

        if (note) {
          await trackChange({
            entityType: "NOTE",
            operation: "CREATE",
            entityId: note.id,
            entityName: name,
            parentFolderId,
          });
        }
      }

      if ((await getAuthKey()) !== undefined || (await getAuthKey()) === "") {
        scheduleSync(db, workspaceId);
      }

      setModalState(null);
      await refreshActiveTree();
    } catch (error) {
      console.error("Erro ao criar item:", error);
      Alert.alert("Erro", "Não foi possível criar o item.");
    }
  };

  /**
   * ---------------------------------------------------------
   * EDIT
   * ---------------------------------------------------------
   */

  const handleEditItem = (
    id: string,
    type: "folder" | "note",
    label: string,
    parentFolderId: string | null,
  ) => {
    setModalState({
      type: "edit",
      entity: type,
      nodeId: id,
      defaultValue: label,
      parentFolderId,
    });
  };

  const handleConfirmEdit = async (name: string) => {
    if (!modalState || modalState.type !== "edit") return;

    const { entity, nodeId, parentFolderId } = modalState;

    try {
      if (entity === "folder") {
        await updateFolderAsync(db, nodeId, {
          name,
          parent_folder_id: parentFolderId,
        });
      } else {
        await updateNoteAsync(db, nodeId, {
          title: name,
          folder_id: parentFolderId,
        });
      }

      await trackChange({
        entityType: entity === "folder" ? "FOLDER" : "NOTE",
        operation: "UPDATE",
        entityId: nodeId,
        entityName: name,
        parentFolderId,
      });

      if ((await getAuthKey()) != null) {
        scheduleSync(db, workspaceId);
      }

      setModalState(null);
      await refreshActiveTree();
    } catch (error) {
      console.error("Erro ao editar item:", error);
      Alert.alert("Erro", "Não foi possível atualizar o item.");
    }
  };

  /**
   * ---------------------------------------------------------
   * DELETE
   * ---------------------------------------------------------
   */

  const handleDeleteItem = (
    id: string,
    type: "folder" | "note",
    label: string,
    parentFolderId: string | null,
  ) => {
    const isFolder = type === "folder";

    Alert.alert(
      isFolder ? "Excluir pasta" : "Excluir nota",
      isFolder
        ? "Tem certeza que deseja excluir esta pasta?"
        : "Tem certeza que deseja excluir esta nota?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              if (isFolder) {
                await deleteFolderAsync(db, id);
              } else {
                await deleteNoteAsync(db, id);
              }

              await trackChange({
                entityType: isFolder ? "FOLDER" : "NOTE",
                operation: "DELETE",
                entityId: id,
                entityName: label,
                parentFolderId,
              });
              if (await getAuthKey()) {
                scheduleSync(db, workspaceId);
              }

              await refreshActiveTree();
            } catch (error) {
              console.error("Erro ao excluir:", error);
              Alert.alert("Erro", "Não foi possível excluir o item.");
            }
          },
        },
      ],
    );
  };

  /**
   * ---------------------------------------------------------
   * MOVE
   * ---------------------------------------------------------
   */

  const handleItemMove = async (
    id: string,
    name: string,
    type: "folder" | "note" | undefined,
    targetFolderId: string | null,
  ) => {
    if (!type) return;

    try {
      if (type === "folder") {
        await updateFolderAsync(db, id, {
          name,
          parent_folder_id: targetFolderId,
        });
      } else {
        await updateNoteAsync(db, id, {
          title: name,
          folder_id: targetFolderId,
        });
      }

      await trackChange({
        entityType: type === "folder" ? "FOLDER" : "NOTE",
        operation: "UPDATE",
        entityId: id,
        entityName: name,
        parentFolderId: targetFolderId,
      });
      if (await getAuthKey()) {
        scheduleSync(db, workspaceId);
      }

      await refreshActiveTree();
    } catch (error) {
      console.error("Erro ao mover item:", error);
      Alert.alert("Erro", "Não foi possível mover o item.");
    }
  };

  /**
   * ---------------------------------------------------------
   * MODAL
   * ---------------------------------------------------------
   */

  const isModalVisible = modalState !== null;

  const handleCloseModal = () => {
    setModalState(null);
  };

  useEffect(() => {
    refreshActiveTree();
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <ThemedView style={styles.screen}>
        <ThemedView style={styles.header}>
          <ThemedText type="title">{workspaceName}</ThemedText>

          <View style={styles.rootActions}>
            <TouchableOpacity
              style={styles.rootBtn}
              onPress={() => handleOpenCreateFolderDialog(null)}
            >
              <Feather name="folder-plus" size={15} color="#0055ff" />

              <ThemedText style={styles.rootBtnText}>New Folder</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.rootBtn}
              onPress={() => handleOpenCreateNoteDialog(null)}
            >
              <Feather name="file-plus" size={15} color="#0055ff" />

              <ThemedText style={styles.rootBtnText}>New Note</ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>

        <ModalForm
          visible={isModalVisible}
          type={modalState?.type ?? "create"}
          entity={modalState?.entity ?? "folder"}
          defaultValue={
            modalState?.type === "edit" ? modalState.defaultValue : ""
          }
          onConfirm={
            modalState?.type === "edit"
              ? handleConfirmEdit
              : handleConfirmCreate
          }
          onClose={handleCloseModal}
        />

        <TreeView<ItemMetadata>
          data={treeData}

          activeEditId={activeEditNodeId}

          onActiveEditChange={setActiveEditNodeId}

          actions={{
            onNodePress: (node) => {
              if (node.data?.type === "note") redirectToNoteById(node.id);
            },

            onEditNode: (node) => {
              if (!node.data) return;
              handleEditItem(
                node.id,
                node.data.type,
                node.label,
                node.data.parentFolderId,
              );
            },

            onDeleteNode: (node) => {
              if (!node.data) return;
              handleDeleteItem(
                node.id,
                node.data.type,
                node.label,
                node.data.parentFolderId,
              );
            },

            onCreateChild: (parentNode) => {
              if (parentNode.data?.type !== "folder") return;
              handleOpenCreateFolderDialog(parentNode.id);
            },

            onMoveNode: async (sourceNode, targetFolderId) => {
              await handleItemMove(
                sourceNode.id,
                sourceNode.label,
                sourceNode.data?.type,
                targetFolderId,
              );
            },
          }}
        />
      </ThemedView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  screen: {
    flex: 1,
    paddingHorizontal: 30,
  },

  header: {
    marginTop: 30,
    marginBottom: 16,
  },

  rootActions: {
    flexDirection: "row",
    marginTop: 12,
    gap: 10,
  },

  rootBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    outlineWidth: 1,
    outlineColor: "#7a7a7a49",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },

  rootBtnText: {
    color: "#0055ff",
    fontWeight: "500",
    fontSize: 13,
  },
});
