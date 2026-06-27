import { Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import { v4 as uuid } from "uuid";
import Modal from "./Modal";

export interface ConfirmModalProps {
  modalId: string;
  label: string;
  onConfirm: () => void;
}

function ConfirmModal ({
  label,
  modalId,
  onConfirm,
}: ConfirmModalProps) {
  return (
    <Modal
      modalId={modalId}
      onConfirm={handleConfirm}
    >
      <Text size='sm' c='dimmed'>{label}</Text>
    </Modal>
  );

  function handleConfirm () {
    onConfirm();
  }
}

export function openConfirmModal (
  title: string,
  label: string,
  onConfirm: () => void,
) {
  const id = uuid();

  modals.open({
    modalId: id,
    title,
    children: <ConfirmModal
      modalId={id}
      label={label}
      onConfirm={onConfirm}
    />,
    withCloseButton: false,
  });
}

export default ConfirmModal;
