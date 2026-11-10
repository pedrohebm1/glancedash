import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRef, useState } from "react";
import {
  LayoutRectangle,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";

import { ThemedIcon } from "@/components/themed-icon";
import { ThemedText } from "@/components/themed-text";
import { TreeActions, TreeNode } from "./types";
import { useTimedDragAndEditGesture } from "./useTimedDragAndGestures";

interface TreeNodeItemProps<T> {
  node: TreeNode<T>;
  actions?: TreeActions<T>;
  activeEditId?: string | null;
  dropTargetId?: string | null;
  onSetEditingId?: (id: string | null) => void;
  onRegisterLayout?: (
    nodeId: string,
    layout: LayoutRectangle,
    isFolder: boolean,
  ) => void;
  onDragUpdate?: (absoluteY: number, absoluteX: number) => void;
  onDragEnd?: (
    sourceNode: TreeNode<T>,
    absoluteY: number,
    absoluteX: number,
  ) => void;
}

export function TreeNodeItem<T>({
  node,
  actions,
  activeEditId,
  dropTargetId,
  onSetEditingId,
  onRegisterLayout,
  onDragUpdate,
  onDragEnd,
}: TreeNodeItemProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const isBranch = Boolean(node.children && node.children.length > 0);
  const isEditing = activeEditId === node.id;
  const isDropTarget = dropTargetId === node.id;
  const viewRef = useRef<View>(null);

  const { gesture, animatedStyle } = useTimedDragAndEditGesture({
    onEnterEdit: () => onSetEditingId?.(node.id),
    onExitEditAndStartDrag: () => {
      if (activeEditId === node.id) {
        onSetEditingId?.(null);
      }
    },
    onDragUpdate,
    onDragEnd: (absY, absX) => {
      onDragEnd?.(node, absY, absX);
    },
  });

  const handleLayout = () => {
    viewRef.current?.measureInWindow((x, y, width, height) => {
      if (y > 0) {
        onRegisterLayout?.(node.id, { x, y, width, height }, isBranch);
      }
    });
  };

  const handlePress = () => {
    if (isEditing) return;
    if (isBranch) {
      setIsOpen((prev) => !prev);
    } else {
      actions?.onNodePress?.(node);
    }
  };

  const defaultIcon = isBranch
    ? isOpen
      ? "folder-open-o"
      : "folder-o"
    : "file-text";

  return (
    <Animated.View style={[styles.nodeContainer, animatedStyle]}>
      <GestureDetector gesture={gesture}>
        <View
          ref={viewRef}
          onLayout={handleLayout}
          style={[
            styles.row,
            isEditing && styles.rowEditing,
            isDropTarget && styles.rowDropTarget,
          ]}
        >
          <TouchableOpacity
            style={styles.clickableContent}
            onPress={handlePress}
            activeOpacity={0.7}
          >
            {isBranch && (
              <ThemedText style={[styles.arrow, isOpen && styles.arrowRotated]}>
                {">"}
              </ThemedText>
            )}

            <ThemedIcon
              as={FontAwesome}
              name={node.iconName || defaultIcon}
              size={18}
              lightColor={isDropTarget ? "#007AFF" : "#6e6e6e"}
            />

            <ThemedText
              style={[styles.label, isDropTarget && styles.labelDropTarget]}
              numberOfLines={1}
            >
              {node.label}
            </ThemedText>
          </TouchableOpacity>
          {isEditing ? (
            <View style={styles.actionGroup}>
              <TouchableOpacity
                onPress={() => actions?.onEditNode?.(node)}
                style={styles.iconBtn}
              >
                <FontAwesome name="pencil" size={14} color="#007AFF" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => actions?.onDeleteNode?.(node)}
                style={styles.iconBtn}
              >
                <FontAwesome name="trash" size={14} color="#FF3B30" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onSetEditingId?.(null)}
                style={styles.iconBtn}
              >
                <FontAwesome name="times" size={16} color="#8E8E93" />
              </TouchableOpacity>
            </View>
          ) : (
            isBranch && (
              <View style={styles.actionGroup}>
                <TouchableOpacity
                  onPress={() => actions?.onCreateChild?.(node)}
                  style={styles.iconBtn}
                >
                  <ThemedText style={styles.addText}>+</ThemedText>
                </TouchableOpacity>
              </View>
            )
          )}
        </View>
      </GestureDetector>
      {isBranch && isOpen && (
        <View style={styles.childrenIndent}>
          {node.children && node.children.length > 0 ? (
            node.children.map((child) => (
              <TreeNodeItem
                key={child.id}
                node={child}
                actions={actions}
                activeEditId={activeEditId}
                dropTargetId={dropTargetId}
                onSetEditingId={onSetEditingId}
                onRegisterLayout={onRegisterLayout}
                onDragUpdate={onDragUpdate}
                onDragEnd={onDragEnd}
              />
            ))
          ) : (
            <ThemedText style={styles.emptyText}>Vazio</ThemedText>
          )}
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  nodeContainer: { marginBottom: 4 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 44,
    paddingHorizontal: 12,
    backgroundColor: "rgba(0,0,0,0.03)",
    borderRadius: 6,
  },
  rowEditing: {
    borderWidth: 1,
    borderColor: "#FF9500",
    backgroundColor: "rgba(255,149,0,0.08)",
  },
  rowDropTarget: {
    borderWidth: 2,
    borderColor: "#007AFF",
    backgroundColor: "rgba(0,122,255,0.12)",
  },
  clickableContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingVertical: 8,
  },
  label: { marginLeft: 10, flex: 1 },
  labelDropTarget: { color: "#007AFF", fontWeight: "bold" },
  arrow: { marginRight: 8, fontSize: 14 },
  arrowRotated: { transform: [{ rotate: "90deg" }] },
  childrenIndent: {
    marginLeft: 16,
    borderLeftWidth: 1,
    borderLeftColor: "rgba(0,0,0,0.08)",
    paddingLeft: 8,
    marginTop: 4,
  },
  emptyText: {
    fontSize: 12,
    color: "gray",
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  actionGroup: { flexDirection: "row", alignItems: "center", gap: 4 },
  iconBtn: { padding: 6 },
  addText: { fontSize: 16, color: "#007AFF", fontWeight: "bold" },
});
