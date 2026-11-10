
export type TreeNode<T = Record<string, any>> = {
  id: string;
  label: string;
  iconName?: string;
  children?: TreeNode<T>[];
  data?: T; // Dados arbitrários associados ao nó (ex: workspaceId, noteId)
};

export interface TreeActions<T = Record<string, any>> {
  onNodePress?: (node: TreeNode<T>) => void;
  onEditNode?: (node: TreeNode<T>) => void;
  onDeleteNode?: (node: TreeNode<T>) => void;
  onCreateChild?: (parentNode: TreeNode<T>) => void;
  
  /**
   * Chamado quando um nó é solto sobre uma pasta ou na raiz.
   * @param sourceNode O item que foi arrastado
   * @param targetFolderId O ID da pasta de destino (null = mover para a Raiz)
   */
  onMoveNode?: (sourceNode: TreeNode<T>, targetFolderId: string | null) => void;
}

export interface TreeViewProps<T = Record<string, any>> {
  data: TreeNode<T>[];
  actions?: TreeActions<T>;
  activeEditId?: string | null;
  onActiveEditChange?: (id: string | null) => void;
}