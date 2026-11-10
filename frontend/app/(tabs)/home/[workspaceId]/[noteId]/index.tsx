import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  AppState,
  AppStateStatus,
  Keyboard,
  StyleSheet,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { EditorToolbar } from "@/components/editor-tool-bar";
import { NotePreview } from "@/components/note-preview";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import InteractableButton from "@/components/ui/interactable-button";
import {
  getNoteById,
  NoteInput,
  updateNoteAsync,
} from "@/db/repositories/NoteRepository";
import { trackPendingChange } from "@/db/repositories/PendingChangesRepository";
import { addRecentNote } from "@/db/repositories/RecentNotes";
import { useSyncStore } from "@/hooks/useSyncStorage";
import { getAuthKey } from "@/lib/SecureStore";
import {
  Selection,
  toggleInlineFormatting,
  toggleLinePrefix,
} from "@/utils/markdownUtils";
import { renderFormattedText } from "@/utils/renderFormattedText";

export default function Index() {
  const db = useSQLiteContext();
  const { noteId } = useLocalSearchParams<{ noteId: string }>();
  const scheduleSync = useSyncStore((s) => s.scheduleSync);

  const [isInteractableButtonOpened, setInteractableButtonOpened] =
    useState<boolean>(false);

  const [workspaceId, setWorkspaceId] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [mode, setMode] = useState<"edit" | "preview">("preview");
  const [folderParentId, setFolderParentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selection, setSelection] = useState<Selection>({ start: 0, end: 0 });

  const inputRef = useRef<TextInput>(null);
  const contentRef = useRef(content);

  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  useEffect(() => {
    const keyboardSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setMode("preview");
    });
    return () => keyboardSubscription.remove();
  }, []);

  useEffect(() => {
    async function carregarNota() {
      if (!noteId) return;
      try {
        setIsLoading(true);
        const noteDatabase = await getNoteById(db, noteId);
        if (noteDatabase) {
          setContent(noteDatabase.content || "");
          setTitle(noteDatabase.title || "Nota Sem Título");
          setWorkspaceId(noteDatabase.workspace_id);
          setFolderParentId(noteDatabase.folder_id);
        }
      } catch (error) {
        console.error("Erro ao buscar a nota no banco:", error);
      } finally {
        setIsLoading(false);
      }
    }

    carregarNota();
  }, [db, noteId]);

  const executarSalvamentoImediato = useCallback(async () => {
    if (noteId === undefined) return;
    try {
      const data: NoteInput = {
        workspace_id: workspaceId,
        content: contentRef.current,
        title: title,
      };
      await updateNoteAsync(db, noteId, data);
      await addRecentNote(db, { note_id: noteId });

      await trackPendingChange(db, {
        entityId: noteId,
        entityType: "NOTE",
        operation: "UPDATE",
        workspaceId: workspaceId,
      });

      if ((await getAuthKey()) != null) {
        scheduleSync(db, workspaceId);
      }
      console.log("salvo");
    } catch (error) {
      console.error("Erro no salvamento de emergência:", error);
    }
  }, [db, noteId, title, workspaceId]);

  useEffect(() => {
    if (isLoading) return;

    const timerId = setTimeout(() => {
      executarSalvamentoImediato();
    }, 2000);

    return () => clearTimeout(timerId);
  }, [content, isLoading]);

  useFocusEffect(
    useCallback(() => {
      const assinatura = AppState.addEventListener(
        "change",
        (nextState: AppStateStatus) => {
          if (nextState === "background" || nextState === "inactive") {
            executarSalvamentoImediato();
          }
        },
      );

      return () => {
        executarSalvamentoImediato();
        assinatura.remove();
      };
    }, [executarSalvamentoImediato]),
  );

  const handlePressPreview = () => {
    setMode("edit");
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const handleApplyStyle = (
    type: "bold" | "italic" | "h1" | "h2" | "h3" | "list" | "code",
  ) => {
    let result: { newContent: string; newSelection: Selection };

    switch (type) {
      case "bold":
        result = toggleInlineFormatting(content, selection, "**", "**");
        break;
      case "italic":
        result = toggleInlineFormatting(content, selection, "*", "*");
        break;
      case "code":
        result = toggleInlineFormatting(content, selection, "`", "`");
        break;
      case "h1":
        result = toggleLinePrefix(content, selection, "# ");
        break;
      case "h2":
        result = toggleLinePrefix(content, selection, "## ");
        break;
      case "h3":
        result = toggleLinePrefix(content, selection, "### ");
        break;
      case "list":
        result = toggleLinePrefix(content, selection, "- ");
        break;
    }

    setContent(result.newContent);
    setTimeout(() => {
      inputRef.current?.focus();
      setSelection(result.newSelection);
    }, 50);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <ThemedText style={styles.loadingText}>Carregando nota...</ThemedText>
      </SafeAreaView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {mode === "edit" ? (
        <>
          <TextInput
            ref={inputRef}
            style={styles.input}
            multiline
            placeholder="Digite em Markdown..."
            onChangeText={setContent}
            textAlignVertical="top"
            selection={selection}
            onSelectionChange={(e) => setSelection(e.nativeEvent.selection)}
          >
            {renderFormattedText(content)}
          </TextInput>
          <EditorToolbar onApplyStyle={handleApplyStyle} />
        </>
      ) : (
        <NotePreview content={content} onPress={handlePressPreview} />
      )}
      {mode !== "edit" && (
        <InteractableButton
          isOpened={isInteractableButtonOpened}
          handlePress={() =>
            setInteractableButtonOpened(!isInteractableButtonOpened)
          }
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  input: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    lineHeight: 24,
  },
});
