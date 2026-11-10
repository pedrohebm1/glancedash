import { useEffect, useState } from "react";
import Dialog from "react-native-dialog";

interface ModalFormProps {
  visible: boolean;
  type: "edit" | "create";
  entity: "folder" | "note";
  defaultValue?: string;
  onConfirm: (name: string) => void | Promise<void>;
  onClose: () => void;
}

export default function ModalForm({
  visible,
  type,
  entity,
  defaultValue = "",
  onConfirm,
  onClose,
}: ModalFormProps) {
  const [name, setName] = useState(defaultValue);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setName(defaultValue);
  }, [defaultValue, visible]);

  const handleConfirm = async () => {
    const trimmedName = name.trim();

    if (!trimmedName || loading) {
      return;
    }

    try {
      setLoading(true);

      await onConfirm(trimmedName);
    } finally {
      setLoading(false);
    }
  };

  const isEdit = type === "edit";
  const isFolder = entity === "folder";

  return (
    <Dialog.Container visible={visible}>
      <Dialog.Title>
        {isEdit
          ? isFolder
            ? "Editar Pasta"
            : "Editar Nota"
          : isFolder
            ? "Nova Pasta"
            : "Nova Nota"}
      </Dialog.Title>

      <Dialog.Description>
        {isEdit
          ? isFolder
            ? "Digite o novo nome da pasta:"
            : "Digite o novo título da nota:"
          : isFolder
            ? "Digite o nome da nova pasta:"
            : "Digite o título da nova nota:"}
      </Dialog.Description>

      <Dialog.Input
        value={name}
        onChangeText={setName}
        placeholder={isFolder ? "Ex: Documentos" : "Ex: Minhas Anotações"}
        autoFocus
        editable={!loading}
      />

      <Dialog.Button label="Cancelar" onPress={onClose} disabled={loading} />

      <Dialog.Button
        label={loading ? "Aguarde..." : isEdit ? "Salvar" : "Criar"}
        onPress={handleConfirm}
        bold
        disabled={loading}
      />
    </Dialog.Container>
  );
}
