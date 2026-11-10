import { WorkspaceCard } from "@/components/workspace/workspace-card";
import { useRecentNotes } from "@/hooks/useRecentNotes";
import { useWorkspaces } from "@/hooks/useWorkspaces";
import formatTimeAgo from "@/utils/formatTimeAgo";
import getTimeBasedGreeting from "@/utils/greetingsTime";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useState } from "react";
import {
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import styles from "./index.styles";
import Constants from "expo-constants"

export default function Index() {
  const db = useSQLiteContext();
  const { workspaces, saveWorkspace, deleteWorkspace, loadWorkspaces } =
    useWorkspaces(db);
  const { recentNotes, loadRecentNotes } = useRecentNotes(db);
  const [isFocused, setIsFocused] = useState<boolean>(true);
  const router = useRouter();

  const redirectToWorkspace = async (id: string, name: string) => {
    router.push({
      pathname: "/(tabs)/home/[workspaceId]",
      params: { workspaceId: id, workspaceName: name },
    });
  };

  const redirectToNote = async (workspaceId: string, noteId: string) => {
    router.push({
      pathname: "/(tabs)/home/[workspaceId]/[noteId]",
      params: { workspaceId: workspaceId, noteId: noteId },
    });
  };

  useEffect(() => {
    if (isFocused) {
      loadWorkspaces();
      loadRecentNotes();
    }
  }, [isFocused]);

  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);

      return () => {
        setIsFocused(false);
      };
    }, []),
  );

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
      >
        <View style={styles.welcomeBanner}>
          <View style={styles.bannerBackgroundCircle} />
          <Text style={styles.dateText}>{currentDate}</Text>
          <Text style={styles.welcomeText}>{getTimeBasedGreeting()}</Text>

          <View style={styles.workspaceBadge}>
            <View style={styles.badgeDot} />
            <Text style={styles.badgeText}>
              {workspaces.length}{" "}
              {workspaces.length === 1 ? "workspace" : "workspaces"}
            </Text>
          </View>
        </View>

        {recentNotes.length !== 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent</Text>
              <TouchableOpacity style={styles.seeAllButton}>
                <Text style={styles.seeAllText}>See all</Text>
                <Feather name="chevron-right" size={16} color="#5856d6" />
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.horizontalScroll}
            >
              {recentNotes.map((recentAccess) => (
                <TouchableOpacity
                  onPress={() =>
                    redirectToNote(
                      recentAccess.workspaceId,
                      recentAccess.noteId,
                    )
                  }
                  key={recentAccess.noteId}
                  style={styles.recentCard}
                >
                  <Text style={styles.cardTitle}>{recentAccess.title}</Text>
                  <Text style={styles.cardDescription} numberOfLines={3}>
                    {recentAccess.contentPreview}
                  </Text>
                  <View style={styles.cardFooter}>
                    <View style={styles.timeTag}>
                      <Text style={styles.timeTagText}>
                        {formatTimeAgo(recentAccess.accessed_at)}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.workspacesSection}>
          <Text style={styles.sectionTitle}>Workspaces</Text>

          <View style={styles.workspaceList}>
            {workspaces.map((workspace) => (
              <WorkspaceCard
                key={workspace.workspaceId}
                workspace={{
                  id: workspace.workspaceId,
                  name: workspace.title,
                  note_count: workspace.noteCount,
                }}
                onSave={saveWorkspace}
                onDelete={deleteWorkspace}
                onPress={redirectToWorkspace}
              />
            ))}
            <WorkspaceCard
              onSave={saveWorkspace}
              onDelete={deleteWorkspace}
              isCreateCard={true}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
