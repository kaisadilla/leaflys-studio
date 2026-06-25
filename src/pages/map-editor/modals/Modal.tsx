import { Button } from "@mantine/core";
import { modals } from "@mantine/modals";
import { $cl } from "utils";
import styles from './Modal.module.scss';

export interface ModalProps {
  modalId: string;
  confirmLabel?: React.ReactNode;
  cancelLabel?: React.ReactNode;
  onConfirm?: () => void;
  onCancel?: () => void;
  classNames?: {
    modal?: string;
    form?: string;
  };
  children?: React.ReactNode;
}

function Modal ({
  modalId,
  confirmLabel = "OK",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  classNames,
  children,
}: ModalProps) {

  return (
    <div className={$cl(styles.modal, classNames?.modal)}>
      <div className={$cl(styles.form, classNames?.form)}>
        {children}
      </div>

      <div className={styles.footer}>
        <Button
          variant='outline'
          onClick={handleCancel}
        >
          {cancelLabel}
        </Button>
        <Button
          onClick={handleConfirm}
        >
          {confirmLabel}
        </Button>
      </div>
    </div>
  );

  function handleConfirm () {
    onConfirm?.();
    modals.close(modalId);
  }

  function handleCancel () {
    onCancel?.();
    modals.close(modalId);
  }
}

export default Modal;
