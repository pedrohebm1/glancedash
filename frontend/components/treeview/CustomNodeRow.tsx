import Feather from "@expo/vector-icons/Feather";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { StyleSheet, View } from "react-native";
import { TreeNode } from "react-native-tree-multi-select";
import { ThemedIcon } from "../themed-icon";
import { ThemedText } from "../themed-text";

interface CustomNodeRowProps {
  node: TreeNode; 
  level: number;
  onEdit?: (id: string, name: string) => void;
  onRemove?: (id: string, isFolder: boolean) => void;
  onOpenNote?: (id: string, name: string) => void;
}

const folderConfig = {
  iconIdleName: "folder",
  lightColor: "#007AFF",
  iconSize: 20,
};

const noteConfig = {
  iconIdleName: "file-text",
  lightColor: "#8801c7",
  iconSize: 20,
};

export function CustomNodeRow({
  node,
  onOpenNote,
  onEdit,
  onRemove,
}: CustomNodeRowProps) {
  const isFolder = node.children !== undefined;
  if (node.type == "folder") {
    return (
      <View style={styles.rowContainer}>
        <ThemedIcon
          as={FontAwesome}
          name={folderConfig.iconIdleName}
          lightColor={folderConfig.lightColor}
          size={folderConfig.iconSize}
        />
        <ThemedText>{node.name}</ThemedText>
      </View>
    );
  }

  if (node.type == "note") {
    return (
      <View style={styles.rowContainer}>
        <ThemedIcon
          as={Feather}
          name={noteConfig.iconIdleName}
          lightColor={noteConfig.lightColor}
          size={noteConfig.iconSize}
        />
        <ThemedText>{node.name}</ThemedText>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    gap: 10,
  },
  icon: {
    marginRight: 8,
  },
  nodeText: {
    flex: 1,
    fontSize: 17,
    color: "#1f2937",
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    padding: 4,
  },
});
