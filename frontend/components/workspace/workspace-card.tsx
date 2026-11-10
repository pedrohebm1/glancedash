import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Dialog from "react-native-dialog";

interface Workspace {
  id: string;
  name: string;
  note_count?: number;
}

interface WorkspaceCardProps {
  workspace?: Workspace;
  onSave: (workspace: Omit<Workspace, "id"> & { id?: string }) => void;
  onDelete?: (id: string) => void;
  onPress?: (id: string, name: string) => void;
  isCreateCard?: boolean;
}

export const WorkspaceCard = ({
  workspace,
  onSave,
  onDelete,
  onPress,
  isCreateCard,
}: WorkspaceCardProps) => {
  const [dialogVisible, setDialogVisible] = useState(false);
  const [name, setName] = useState(workspace?.name || "");
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const handleOpenDialog = () => {
    setName(workspace?.name || "");
    setDialogVisible(true);
  };

  const handleCancelDialog = () => {
    setDialogVisible(false);
    if (isCreateCard) setName("");
  };

  const handleSaveDialog = () => {
    if (!name.trim()) return;

    onSave({
      id: workspace?.id,
      name: name.trim(),
    });

    setDialogVisible(false);
    if (isCreateCard) setName("");
  };

  if (isCreateCard) {
    return (
      <View style={{ width: "48%" }}>
        <TouchableOpacity style={styles.createCard} onPress={handleOpenDialog}>
          <Feather name="plus" size={24} color="#94a3b8" />
          <Text style={styles.createCardText}>Criar novo workspace</Text>
        </TouchableOpacity>

        <Dialog.Container
          contentStyle={styles.dialogContent}
          visible={dialogVisible}
        >
          <Dialog.Title style={styles.dialogTitle}>Novo Workspace</Dialog.Title>
          <Dialog.Description style={styles.dialogDescription}>
            Digite o nome do novo workspace:
          </Dialog.Description>
          <Dialog.Input
            value={name}
            onChangeText={setName}
            placeholder="Ex: Projetos, Pessoal..."
            placeholderTextColor="#94a3b8"
            style={styles.dialogInput}
          />
          <Dialog.Button
            label="Cancelar"
            onPress={handleCancelDialog}
            color="#64748b"
          />
          <Dialog.Button
            label="Criar"
            onPress={handleSaveDialog}
            bold
            color="#5856d6"
          />
        </Dialog.Container>
      </View>
    );
  }

  if (isConfirmingDelete && workspace && onDelete) {
    return (
      <View style={[styles.card, styles.deleteCard]}>
        <View style={styles.deleteHeader}>
          <Feather name="alert-triangle" size={20} color="#ef4444" />
          <Text style={styles.deleteTitle}>Excluir Workspace?</Text>
        </View>
        <Text style={styles.deleteText}>
          {`Certeza que deseja remover "${workspace.name}"?`}
        </Text>
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => setIsConfirmingDelete(false)}
          >
            <Text style={styles.cancelBtnText}>Manter</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dangerBtn}
            onPress={() => onDelete(workspace.id)}
          >
            <Text style={styles.dangerBtnText}>Sim, Excluir</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <>
      <TouchableOpacity
        onPress={() =>
          onPress && workspace && onPress(workspace.id, workspace.name)
        }
        style={styles.card}
      >
        <View style={styles.cardHeader}>
          <View style={styles.workspaceIconContainer}>
            <Feather name="briefcase" size={20} color="#5856d6" />
          </View>
          <Text style={styles.title}>{workspace?.name ?? ""}</Text>
          <Text style={styles.noteCounts}>{workspace?.note_count?workspace?.note_count:0} Notes</Text>
        </View>
      </TouchableOpacity>

      <Dialog.Container
        contentStyle={styles.dialogContent}
        visible={dialogVisible}
      >
        <Dialog.Title style={styles.dialogTitle}>Editar Workspace</Dialog.Title>
        <Dialog.Description style={styles.dialogDescription}>
          Atualize o nome do seu workspace:
        </Dialog.Description>
        <Dialog.Input
          value={name}
          onChangeText={setName}
          style={styles.dialogInput}
        />
        <Dialog.Button
          label="Cancelar"
          onPress={handleCancelDialog}
          color="#64748b"
        />
        <Dialog.Button
          label="Salvar"
          onPress={handleSaveDialog}
          bold
          color="#5856d6"
        />
      </Dialog.Container>
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    flexDirection: "column",
    width: "48%",
    height: 140,
  },
  cardHeader: {
    flexDirection: "column",
    flex: 1,
    gap: 2,
  },
  workspaceIconContainer: {
    width: 35,
    height: 35,
    backgroundColor: "#f8fafc",
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 17,
    color: "#0f172a",
    fontWeight: "700",
    fontFamily: "Manrope_Regular",
  },
  noteCounts: {
    fontSize: 15,
    opacity: 0.7,
    fontWeight: "700",
    color: "#0f172a",
    fontFamily: "Manrope_Regular",
  },

  createCard: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#e2e8f0",
    flexDirection: "column",
    justifyContent: "center",
    gap: 5,
    alignItems: "center",
    width: "100%",
    height: 140,
  },
  createCardText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#94a3b8",
    textAlign: "center",
  },

  deleteCard: {
    borderColor: "#fecaca",
    backgroundColor: "#fef2f2",
    flexDirection: "column",
    alignItems: "stretch",
  },
  deleteHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  deleteTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#b91c1c",
  },
  deleteText: {
    color: "#475569",
    fontSize: 14,
    marginBottom: 16,
  },

  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  inlineEditBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
  },
  inlineEditText: {
    color: "#5856d6",
    fontWeight: "600",
    fontSize: 13,
  },
  inlineDeleteBtn: {
    padding: 8,
    backgroundColor: "#fef2f2",
    borderRadius: 12,
  },

  cancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    justifyContent: "center",
  },
  cancelBtnText: {
    color: "#64748b",
    fontWeight: "600",
  },
  dangerBtn: {
    backgroundColor: "#ef4444",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  dangerBtnText: {
    color: "#ffffff",
    fontWeight: "600",
  },

  dialogContent: {
    borderRadius: 24,
    backgroundColor: "#ffffff",
    padding: 20,
  },
  dialogTitle: {
    color: "#0f172a",
    fontWeight: "700",
  },
  dialogDescription: {
    color: "#64748b",
  },
  dialogInput: {
    color: "#0f172a",
  },
});
