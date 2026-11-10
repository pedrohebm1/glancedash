import { Folder } from "@/db/repositories/FolderRepository";
import { Note } from "@/db/repositories/NoteRepository";

export type TreeNodeType = 
  | { type: 'folder'; id: string; name: string; children: TreeNodeType[] }
  | { type: 'note'; id: string; name: string };

export function buildTree(folders: Folder[], notes: Note[]): TreeNodeType[] {
  const activeFolders = folders.filter(f => !f.is_deleted);
  const activeNotes = notes.filter(n => !n.is_deleted);

  const folderMap: Record<string, { type: 'folder'; id: string; name: string; children: TreeNodeType[] }> = {};
  const rootNodes: TreeNodeType[] = [];

  activeFolders.forEach(folder => {
    folderMap[folder.id] = { type: 'folder', id: folder.id, name: folder.name, children: [] };
  });

  activeNotes.forEach(note => {
    const noteNode: TreeNodeType = { type: 'note', id: note.id, name: note.title };
    if (note.folder_id && folderMap[note.folder_id]) {
      folderMap[note.folder_id].children.push(noteNode);
    } else {
      rootNodes.push(noteNode);
    }
  });

  activeFolders.forEach(folder => {
    const currentFolderNode = folderMap[folder.id];
    if (folder.parent_folder_id && folderMap[folder.parent_folder_id]) {
      folderMap[folder.parent_folder_id].children.push(currentFolderNode);
    } else {
      rootNodes.push(currentFolderNode);
    }
  });

  return rootNodes;
}