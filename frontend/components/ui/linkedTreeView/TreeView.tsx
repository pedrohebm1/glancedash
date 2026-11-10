import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useMemo, useRef, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { ThemedIcon } from '@/components/themed-icon';
import { ThemedText } from '@/components/themed-text';

export type TreeNode<T = Record<string, any>> = {
  id: string;
  label: string;
  iconName?: string;
  children?: TreeNode<T>[];
  data?: T;
};

export interface TreeActions<T = Record<string, any>> {
  onNodePress?: (node: TreeNode<T>) => void;
  onEditNode?: (node: TreeNode<T>) => void;
  onDeleteNode?: (node: TreeNode<T>) => void;
  onCreateChild?: (parentNode: TreeNode<T>) => void;
  onMoveNode?: (sourceNode: TreeNode<T>, targetFolderId: string | null) => void;
}

export interface TreeViewProps<T = Record<string, any>> {
  data: TreeNode<T>[];
  actions?: TreeActions<T>;
  activeEditId?: string | null;
  onActiveEditChange?: (id: string | null) => void;
}

export interface FlatTreeNode<T = any> {
  id: string;
  label: string;
  iconName?: string;
  depth: number;
  isFolder: boolean;
  parentId: string | null;
  node: TreeNode<T>;
}

const ITEM_HEIGHT = 44;
const INDENT_SIZE = 18;

// flatten tree utility

function flattenTree<T>(
  nodes: TreeNode<T>[],
  expandedFolderIds: Set<string>,
  depth = 0,
  parentId: string | null = null
): FlatTreeNode<T>[] {
  let result: FlatTreeNode<T>[] = [];

  for (const node of nodes) {
    const isFolder = Boolean(node.children);

    result.push({
      id: node.id,
      label: node.label,
      iconName: node.iconName,
      depth,
      isFolder,
      parentId,
      node,
    });

    if (isFolder && expandedFolderIds.has(node.id) && node.children) {
      result = result.concat(
        flattenTree(node.children, expandedFolderIds, depth + 1, node.id)
      );
    }
  }

  return result;
}

export function TreeView<T>({
  data,
  actions,
  activeEditId: controlledActiveEditId,
  onActiveEditChange,
}: TreeViewProps<T>) {
  const [internalActiveEditId, setInternalActiveEditId] = useState<string | null>(null);
  const [expandedFolderIds, setExpandedFolderIds] = useState<Set<string>>(new Set());
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);

  const containerRef = useRef<View>(null);
  const containerTopY = useRef<number>(0);

  const isControlled = controlledActiveEditId !== undefined;
  const activeEditId = isControlled ? controlledActiveEditId : internalActiveEditId;

  const handleSetEditingId = (id: string | null) => {
    if (isControlled) {
      onActiveEditChange?.(id);
    } else {
      setInternalActiveEditId(id);
    }
  };

  const flatList = useMemo(() => {
    return flattenTree(data, expandedFolderIds);
  }, [data, expandedFolderIds]);

  const handleToggleFolder = (folderId: string) => {
    setExpandedFolderIds((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  const handleContainerLayout = () => {
    containerRef.current?.measureInWindow((_x, y) => {
      if (y > 0) {
        containerTopY.current = y;
      }
    });
  };

  const handleDragUpdate = (absoluteY: number) => {
    const relativeY = absoluteY - containerTopY.current;
    const index = Math.floor(relativeY / ITEM_HEIGHT);

    if (index >= 0 && index < flatList.length) {
      const hoveredItem = flatList[index];

      if (hoveredItem.isFolder) {
        setDropTargetId(hoveredItem.id);
      } else {
        setDropTargetId(hoveredItem.parentId);
      }
    } else {
      setDropTargetId(null);
    }
  };

  const handleDragEnd = (sourceNode: TreeNode<T>) => {
    if (dropTargetId !== sourceNode.id) {
      actions?.onMoveNode?.(sourceNode, dropTargetId);
    }
    setDropTargetId(null);
  };

  return (
    <View
      ref={containerRef}
      onLayout={handleContainerLayout}
      style={styles.container}
    >
      {flatList.map((item) => (
        <TreeRowItem
          key={item.id}
          item={item}
          actions={actions}
          isExpanded={expandedFolderIds.has(item.id)}
          isEditing={activeEditId === item.id}
          isDropTarget={dropTargetId === item.id}
          onToggleFolder={() => handleToggleFolder(item.id)}
          onSetEditingId={handleSetEditingId}
          onDragUpdate={handleDragUpdate}
          onDragEnd={() => handleDragEnd(item.node)}
        />
      ))}
    </View>
  );
}

// Individual line with integrated gesture

interface RowProps<T> {
  item: FlatTreeNode<T>;
  actions?: TreeViewProps<T>['actions'];
  isExpanded: boolean;
  isEditing: boolean;
  isDropTarget: boolean;
  onToggleFolder: () => void;
  onSetEditingId: (id: string | null) => void;
  onDragUpdate: (absY: number) => void;
  onDragEnd: () => void;
}

function TreeRowItem<T>({
  item,
  actions,
  isExpanded,
  isEditing,
  isDropTarget,
  onToggleFolder,
  onSetEditingId,
  onDragUpdate,
  onDragEnd,
}: RowProps<T>) {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const isDragging = useSharedValue(false);

  const editGesture = Gesture.LongPress()
    .minDuration(400)
    .maxDistance(10)
    .onStart(() => {
      'worklet';
      runOnJS(onSetEditingId)(item.id);
    });

  const dragGesture = Gesture.Pan()
    .activateAfterLongPress(1000)
    .maxPointers(1)
    .onStart(() => {
      'worklet';
      isDragging.value = true;
      if (isEditing) {
        runOnJS(onSetEditingId)(null);
      }
    })
    .onUpdate((event) => {
      'worklet';
      translateY.value = event.translationY;
      translateX.value = event.translationX;
      runOnJS(onDragUpdate)(event.absoluteY);
    })
    .onEnd(() => {
      'worklet';
      translateY.value = withSpring(0);
      translateX.value = withSpring(0);
      isDragging.value = false;
      runOnJS(onDragEnd)();
    })
    .onFinalize(() => {
      'worklet';
      isDragging.value = false;
    });

  const gesture = Gesture.Simultaneous(editGesture, dragGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
    ],
    zIndex: isDragging.value ? 999 : 1,
    opacity: isDragging.value ? 0.75 : 1,
  }));

  const handlePress = () => {
    if (isEditing) return;
    if (item.isFolder) {
      if (item.node.children && item.node.children?.length > 0) {
        onToggleFolder();
      }
    } else {
      actions?.onNodePress?.(item.node);
    }
  };

  const defaultIcon = item.isFolder
    ? isExpanded
      ? 'folder-open-o'
      : 'folder-o'
    : 'file-text';

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[
          styles.row,
          { paddingLeft: 12 + (!item.isFolder ? INDENT_SIZE : 0) + item.depth * INDENT_SIZE },
          isEditing && styles.rowEditing,
          isDropTarget && styles.rowDropTarget,
          animatedStyle,
        ]}
      >
        <TouchableOpacity
          style={styles.clickableContent}
          onPress={handlePress}
          activeOpacity={0.7}
        >
          {item.isFolder && (
            <ThemedText style={[styles.arrow, isExpanded && styles.arrowRotated]}>
              {item.node.children && item.node.children?.length > 0 ? '>' : '   '}
            </ThemedText>
          )}

          <ThemedIcon
            as={FontAwesome}
            name={item.iconName || defaultIcon}
            size={18}
            lightColor={isDropTarget ? '#007AFF' : '#5856d6'}
          />

          <ThemedText
            style={[styles.label, isDropTarget && styles.labelDropTarget]}
            numberOfLines={1}
          >
            {item.label}
          </ThemedText>
        </TouchableOpacity>

        {isEditing ? (
          <View style={styles.actionGroup}>
            <TouchableOpacity
              onPress={() => actions?.onEditNode?.(item.node)}
              style={styles.iconBtn}
              hitSlop={8}
            >
              <FontAwesome name="pencil" size={14} color="#007AFF" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => actions?.onDeleteNode?.(item.node)}
              style={styles.iconBtn}
              hitSlop={8}
            >
              <FontAwesome name="trash" size={14} color="#FF3B30" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onSetEditingId(null)}
              style={styles.iconBtn}
              hitSlop={8}
            >
              <FontAwesome name="times" size={16} color="#8E8E93" />
            </TouchableOpacity>
          </View>
        ) : (
          item.isFolder && (
            <View style={styles.actionGroup}>
              <TouchableOpacity
                onPress={() => actions?.onCreateChild?.(item.node)}
                style={styles.iconBtn}
                hitSlop={8}
              >
                <ThemedText style={styles.addText}>+</ThemedText>
              </TouchableOpacity>
            </View>
          )
        )}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  row: {
    height: ITEM_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 12,
    paddingLeft: 30,
  },
  rowEditing: {
    borderWidth: 1,
    borderColor: '#FF9500',
    backgroundColor: 'rgba(255,149,0,0.08)',
  },
  rowDropTarget: {
    borderWidth: 2,
    borderColor: '#007AFF',
    backgroundColor: 'rgba(0,122,255,0.15)',
  },
  clickableContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
    flex: 1,
    height: '100%',
  },
  label: {
    marginLeft: 10,
    flex: 1,
  },
  labelDropTarget: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  arrow: {
    marginRight: 8,
    fontSize: 14,
  },
  arrowRotated: {
    transform: [{ rotate: '90deg' }],
  },
  actionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconBtn: {
    padding: 6,
  },
  addText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: 'bold',
  },
});