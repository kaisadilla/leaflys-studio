import { TextInput } from "@mantine/core";
import { modals } from "@mantine/modals";
import { useState } from "react";
import { v4 as uuid } from "uuid";
import Modal from "./Modal";

export interface TextInputModalForm {
  defaultValue: string;
  modalId: string;
  label: string;
  onConfirm: (name: string) => void;
}

function TextInputModal ({
  defaultValue,
  label,
  modalId,
  onConfirm,
}: TextInputModalForm) {
  const [ name, setName ] = useState(defaultValue);

  return (
    <Modal
      modalId={modalId}
      onConfirm={handleConfirm}
    >
      <TextInput
        value={name}
        onChange={evt => setName(evt.target.value)}
        label={label}
        autoFocus
      />
    </Modal>
  );

  function handleConfirm () {
    onConfirm(name);
  }
}

export function openTextInputModal (
  title: string,
  label: string,
  defaultValue: string,
  onConfirm: (name: string) => void,
) {
  const id = uuid();

  modals.open({
    modalId: id,
    title,
    children: <TextInputModal
      modalId={id}
      label={label}
      defaultValue={defaultValue}
      onConfirm={onConfirm}
    />,
    withCloseButton: false,
  });
}

export default TextInputModal;
