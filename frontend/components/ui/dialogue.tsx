import { useState } from "react";
import Dialog from "react-native-dialog";

interface WorkspaceItemProps {
  type: "folder" | "note";
  defaultValue?: "";
  handleConfirm: (name: string) => void;
  handleCancel: () => void;
}

interface DialogueStatus {
  status: "create" | "edit";
}

export function CreateWorkspaceItem(props: WorkspaceItemProps) {
  const [name, setName] = useState<string>(
    props.defaultValue ? props.defaultValue : "",
  );
  return (
    <Dialog.Container>
      <Dialog.Title>
        {props.type === "folder" ? "Nova Pasta" : "Nova Nota"}
      </Dialog.Title>
      <Dialog.Description>
        {props.type === "folder"
          ? "Digite o nome da nova pasta:"
          : "Digite o título da nova nota:"}
      </Dialog.Description>
      <Dialog.Input
        value={name}
        onChangeText={setName}
        placeholder={
          props.type === "folder" ? "Ex: Documentos" : "Ex: Minhas Anotações"
        }
        autoFocus
      />
      <Dialog.Button label="Cancelar" onPress={props.handleCancel} />
      <Dialog.Button
        label="Criar"
        onPress={() => props.handleConfirm(name)}
        bold
      />
    </Dialog.Container>
  );
}

export function editWorkspaceItem(props: WorkspaceItemProps) {
  const [name, setName] = useState<string>(
    props.defaultValue ? props.defaultValue : "",
  );

  return (
    <>
      <Dialog.Container>
        <Dialog.Title>
          {props.type === "folder" ? "Nova Pasta" : "Nova Nota"}
        </Dialog.Title>
        <Dialog.Description>
          {props.type === "folder"
            ? "Digite o nome da pasta:"
            : "Digite o título da nota:"}
        </Dialog.Description>
        <Dialog.Input
          value={props.defaultValue ? props.defaultValue : ""}
          onChangeText={setName}
          placeholder={
            props.type === "folder" ? "Ex: Documentos" : "Ex: Minhas Anotações"
          }
          autoFocus
        />
        <Dialog.Button label="Cancelar" onPress={props.handleCancel} />
        <Dialog.Button
          label="Editar"
          onPress={() => props.handleConfirm(name)}
          bold
        />
      </Dialog.Container>
    </>
  );
}
