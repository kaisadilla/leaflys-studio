import { TextInput } from "@mantine/core";
import { modals } from "@mantine/modals";
import { useState } from "react";
import { v4 as uuid } from "uuid";
import Modal from "./Modal";

export interface NewDocumentFormProps {
  modalId: string;
  onConfirm: (name: string) => void;
}

function NewDocumentForm ({
  modalId,
  onConfirm,
}: NewDocumentFormProps) {
  const [ name, setName ] = useState("New document");

  return (
    <Modal
      modalId={modalId}
      onConfirm={handleConfirm}
    >
      <TextInput
        value={name}
        onChange={evt => setName(evt.target.value)}
        label="Give the document a name:"
        autoFocus
      />
    </Modal>
  );

  function handleConfirm () {
    onConfirm(name);
  }
}

export function openNewDocumentModal (onConfirm: (name: string) => void) {
  const id = uuid();

  modals.open({
    modalId: id,
    title: 'New document',
    children: <NewDocumentForm modalId={id} onConfirm={onConfirm} />,
    withCloseButton: false,
  });
}

export default NewDocumentForm;
