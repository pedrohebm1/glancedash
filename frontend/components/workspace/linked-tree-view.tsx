import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useState } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';

import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { ThemedIcon } from '../themed-icon';
import { ThemedText } from '../themed-text';
import { TreeNodeType } from './buildTree';

export interface TreeActions {
  onCreateNote: (folderId: string | null) => void;

  onCreateFolder: (
    parentFolderId: string | null
  ) => void;

  onNotePress: (
    noteId: string
  ) => void;

  onEditItem: (
    id: string,
    type: 'folder' | 'note',
    currentName: string
  ) => void;

  onDeleteItem: (
    id: string,
    type: 'folder' | 'note'
  ) => void;

  /**
   * Chamado quando o usuário termina um drag.
   *
   * sourceId:
   * ID do item que foi arrastado.
   *
   * sourceType:
   * folder ou note.
   *
   * targetFolderId:
   * pasta sobre a qual o item foi solto.
   *
   * null = raiz.
   */
  onMoveItem?: (
    sourceId: string,
    sourceType: 'folder' | 'note',
    targetFolderId: string | null
  ) => void;
}

type EditingItem = {
  id: string;
  type: 'folder' | 'note';
} | null;

/* ============================================================
 * NOTE ITEM
 * ============================================================ */

function NoteItem({
  id,
  name,
  actions,
  isEditing,
  onStartEditing,
}: {
  id: string;
  name: string;
  actions: TreeActions;
  isEditing: boolean;
  onStartEditing: () => void;
}) {
  const translateY = useSharedValue(0);
  const isDragging = useSharedValue(false);

  /**
   * Guarda se o Pan realmente chegou a ser ativado.
   *
   * Isso é importante porque:
   *
   * 500ms -> edição
   *
   * ~1000ms + movimento -> drag
   */
  const didDrag = useSharedValue(false);
  const dragGesture = Gesture.Pan()
    .activateAfterLongPress(1000)
    .maxPointers(1)
    .onStart(() => {
      isDragging.value = true;
      didDrag.value = true;
    })
    .onUpdate((event) => {
      translateY.value = event.translationY;
    })
    .onEnd(() => {
      translateY.value = withSpring(0);
      isDragging.value = false;
    })
    .onFinalize(() => {
      isDragging.value = false;
    });

  /**
   * Long press de edição.
   *
   * 500ms é o primeiro nível.
   *
   * O Pan começa somente depois de 1000ms.
   */
  const editGesture = Gesture.LongPress()
    .minDuration(500)
    .maxDistance(10)
    .onEnd((_event, success) => {
      /**
       * Se o Pan já assumiu o gesto, não queremos
       * transformar isso em edição.
       */
      if (success && !didDrag.value) {
        runOnJS(onStartEditing)();
      }

      didDrag.value = false;
    });

  /**
   * Os dois precisam observar o mesmo toque.
   *
   * LongPress = edição
   * Pan = drag depois de 1 segundo
   */
  const gesture = Gesture.Simultaneous(
    editGesture,
    dragGesture
  );

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: translateY.value,
        },
      ],

      zIndex: isDragging.value ? 999 : 1,

      opacity: isDragging.value ? 0.85 : 1,

      shadowOpacity: isDragging.value ? 0.2 : 0,
    };
  });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[
          styles.noteItem,
          animatedStyle,
          isEditing && styles.itemEditing,
        ]}
      >
        <TouchableOpacity
          onPress={() => {
            if (!isEditing) {
              actions.onNotePress(id);
            }
          }}
          style={styles.itemMainContent}
          activeOpacity={0.7}
        >
          <ThemedIcon
            as={FontAwesome}
            name="file-text"
            size={16}
            lightColor="#6e6e6e"
          />

          <ThemedText
            style={styles.itemName}
            numberOfLines={1}
          >
            {name}
          </ThemedText>
        </TouchableOpacity>

        {isEditing && (
          <View style={styles.editActions}>
            <TouchableOpacity
              onPress={() =>
                actions.onEditItem(
                  id,
                  'note',
                  name
                )
              }
              style={styles.actionIconButton}
              hitSlop={8}
            >
              <FontAwesome
                name="pencil"
                size={14}
                color="#007AFF"
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                actions.onDeleteItem(
                  id,
                  'note'
                )
              }
              style={styles.actionIconButton}
              hitSlop={8}
            >
              <FontAwesome
                name="trash"
                size={14}
                color="#FF3B30"
              />
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
    </GestureDetector>
  );
}

/* ============================================================
 * FOLDER ITEM
 * ============================================================ */

function FolderItem({
  id,
  name,
  children,
  actions,
  isEditing,
  onStartEditing,
  editingItem,
  setEditingItem,
}: {
  id: string;
  name: string;
  children: TreeNodeType[];
  actions: TreeActions;
  isEditing: boolean;
  onStartEditing: () => void;
  editingItem: EditingItem;
  setEditingItem: (
    value: EditingItem
  ) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const translateY = useSharedValue(0);
  const isDragging = useSharedValue(false);
  const didDrag = useSharedValue(false);

  /**
   * Folder também pode ser arrastada.
   */
  const dragGesture = Gesture.Pan()
    .activateAfterLongPress(1000)
    .maxPointers(1)
    .onStart(() => {
      isDragging.value = true;
      didDrag.value = true;
    })
    .onUpdate((event) => {
      translateY.value = event.translationY;
    })
    .onEnd(() => {
      translateY.value = withSpring(0);
      isDragging.value = false;
    })
    .onFinalize(() => {
      isDragging.value = false;
    });

  /**
   * Long press para edição.
   */
  const editGesture = Gesture.LongPress()
    .minDuration(500)
    .maxDistance(10)
    .onEnd((_event, success) => {
      if (success && !didDrag.value) {
        runOnJS(onStartEditing)();
      }

      didDrag.value = false;
    });

  const gesture = Gesture.Simultaneous(
    editGesture,
    dragGesture
  );

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: translateY.value,
        },
      ],

      zIndex: isDragging.value ? 999 : 1,

      opacity: isDragging.value ? 0.85 : 1,
    };
  });

  return (
    <Animated.View
      style={[
        styles.folderContainer,
        animatedStyle,
      ]}
    >
      <GestureDetector gesture={gesture}>
        <View
          style={[
            styles.folderHeaderRow,
            isEditing && styles.itemEditing,
          ]}
        >
          <TouchableOpacity
            onPress={() => {
              setIsOpen((value) => !value);
            }}
            style={styles.folderClickArea}
            activeOpacity={0.7}
          >
            <ThemedText
              style={[
                styles.arrow,
                isOpen && styles.rotatedArrow,
              ]}
            >
              {'>'}
            </ThemedText>

            {isOpen ? (
              <ThemedIcon
                as={FontAwesome}
                name="folder-open-o"
                size={20}
              />
            ) : (
              <ThemedIcon
                as={FontAwesome}
                name="folder-o"
                size={20}
              />
            )}

            <ThemedText
              type="defaultSemiBold"
              style={styles.folderName}
              numberOfLines={1}
            >
              {name}
            </ThemedText>
          </TouchableOpacity>

          {isEditing ? (
            <View style={styles.editActions}>
              <TouchableOpacity
                onPress={() =>
                  actions.onEditItem(
                    id,
                    'folder',
                    name
                  )
                }
                style={styles.actionIconButton}
                hitSlop={8}
              >
                <FontAwesome
                  name="pencil"
                  size={14}
                  color="#007AFF"
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  actions.onDeleteItem(
                    id,
                    'folder'
                  )
                }
                style={styles.actionIconButton}
                hitSlop={8}
              >
                <FontAwesome
                  name="trash"
                  size={14}
                  color="#FF3B30"
                />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                onPress={() =>
                  actions.onCreateNote(id)
                }
                style={styles.actionButton}
                hitSlop={6}
              >
                <ThemedText>
                  +
                  <FontAwesome
                    name="file-text"
                    size={12}
                    color="gray"
                  />
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  actions.onCreateFolder(id)
                }
                style={styles.actionButton}
                hitSlop={6}
              >
                <ThemedText>
                  +📁
                </ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </GestureDetector>

      {isOpen && (
        <View style={styles.childrenContainer}>
          {children.length === 0 ? (
            <ThemedText style={styles.emptyText}>
              Pasta vazia
            </ThemedText>
          ) : (
            children.map((child) => (
              <TreeDispatcher
                key={`${child.type}-${child.id}`}
                node={child}
                actions={actions}
                editingItem={editingItem}
                setEditingItem={setEditingItem}
              />
            ))
          )}
        </View>
      )}
    </Animated.View>
  );
}

function TreeDispatcher({
  node,
  actions,
  editingItem,
  setEditingItem,
}: {
  node: TreeNodeType;
  actions: TreeActions;
  editingItem: EditingItem;
  setEditingItem: (
    value: EditingItem
  ) => void;
}) {
  const isEditing =
    editingItem?.id === node.id &&
    editingItem?.type === node.type;

  const startEditing = () => {
    setEditingItem({
      id: node.id,
      type: node.type,
    });
  };

  if (node.type === 'folder') {
    return (
      <FolderItem
        id={node.id}
        name={node.name}
        children={node.children}
        actions={actions}
        isEditing={isEditing}
        onStartEditing={startEditing}
        editingItem={editingItem}
        setEditingItem={setEditingItem}
      />
    );
  }

  if (node.type === 'note') {
    return (
      <NoteItem
        id={node.id}
        name={node.name}
        actions={actions}
        isEditing={isEditing}
        onStartEditing={startEditing}
      />
    );
  }

  return null;
}

/* ============================================================
 * TREE VIEW
 * ============================================================ */

export function TreeView({
  data,
  actions,
}: {
  data: TreeNodeType[];
  actions: TreeActions;
}) {
  /**
   * Apenas um item pode estar em edição por vez.
   *
   * Não existe mais LongPress envolvendo toda a árvore.
   */
  const [
    editingItem,
    setEditingItem,
  ] = useState<EditingItem>(null);

  return (
    <View style={styles.treeRoot}>
      {data.map((node) => (
        <TreeDispatcher
          key={`${node.type}-${node.id}`}
          node={node}
          actions={actions}
          editingItem={editingItem}
          setEditingItem={setEditingItem}
        />
      ))}
    </View>
  );
}

/* ============================================================
 * STYLES
 * ============================================================ */

const styles = StyleSheet.create({
  treeRoot: {
    paddingVertical: 8,
  },

  /* -----------------------------
   * NOTE
   * ----------------------------- */

  noteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    minHeight: 48,

    paddingVertical: 10,
    paddingHorizontal: 12,

    backgroundColor:
      'rgba(0,0,0,0.02)',

    marginBottom: 4,

    borderRadius: 6,
  },

  itemMainContent: {
    flexDirection: 'row',
    alignItems: 'center',

    flex: 1,

    minWidth: 0,
  },

  itemName: {
    flex: 1,
    marginLeft: 10,
  },

  /* -----------------------------
   * FOLDER
   * ----------------------------- */

  folderContainer: {
    marginBottom: 4,
  },

  folderHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    backgroundColor:
      'rgba(0,0,0,0.04)',

    borderRadius: 6,

    paddingRight: 8,

    minHeight: 48,
  },

  folderClickArea: {
    flexDirection: 'row',
    alignItems: 'center',

    flex: 1,

    paddingVertical: 10,
    paddingHorizontal: 12,

    minWidth: 0,
  },

  folderName: {
    marginLeft: 8,
    flex: 1,
  },

  arrow: {
    marginRight: 8,
    fontSize: 17,
  },

  rotatedArrow: {
    transform: [
      {
        rotate: '90deg',
      },
    ],
  },

  childrenContainer: {
    marginLeft: 16,

    borderLeftWidth: 1,

    borderLeftColor:
      'rgba(0,0,0,0.1)',

    paddingLeft: 8,

    marginTop: 4,
  },

  emptyText: {
    fontSize: 12,
    color: 'gray',

    paddingVertical: 8,
    paddingHorizontal: 12,
  },

  /* -----------------------------
   * ACTIONS
   * ----------------------------- */

  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  actionButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,

    marginLeft: 4,
  },

  editActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  actionIconButton: {
    padding: 8,
    marginLeft: 4,
  },

  /* -----------------------------
   * EDITING
   * ----------------------------- */

  itemEditing: {
    borderWidth: 1,
    borderColor: '#FF9500',

    backgroundColor:
      'rgba(255,149,0,0.08)',
  },

  editingBadge: {
    backgroundColor: '#FF9500',

    paddingVertical: 9,
    paddingHorizontal: 12,

    borderRadius: 6,

    marginBottom: 8,

    alignItems: 'center',
  },

  editingBadgeText: {
    color: 'white',

    fontWeight: 'bold',

    fontSize: 12,
  },
});
